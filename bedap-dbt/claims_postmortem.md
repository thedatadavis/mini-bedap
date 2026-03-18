# Incident Post-Mortem: BEDAP Data Quality Circuit Breaker

**Date:** March 17, 2026
**Status:** Resolved
**Impact:** Simulated prevention of bad financial data reaching the Medicare.gov Beneficiary UI.

## Executive Summary
During a routine automated ELT pipeline execution, the dbt test suite correctly identified a critical data anomaly in the claims staging layer. The custom business-logic test `assert_paid_amount_less_than_allowed` failed on 19,712 out of 50,000 records. Because this test is configured as a pipeline circuit breaker, the workflow halted, successfully preventing logically impossible financial records (negative beneficiary out-of-pocket costs) from being exported to the Frontend (BFF) JSON API.

## 1. Timeline (Simulated)
* **01:45:51 UTC** - dbt orchestration triggered via `run_local.sh`.
* **01:45:51 UTC** - Staging and mart models successfully built in DuckDB.
* **01:45:52 UTC** - Quality test suite initiated.
* **01:45:52 UTC** - `assert_paid_amount_less_than_allowed` returns a `FAIL` status.
* **01:45:53 UTC** - Pipeline gracefully halts; downstream UI exports are canceled.

## 2. Root Cause Analysis
The failure was traced to the synthetic data generation logic used to populate the raw `claim.csv` seed. 

In the initial generation script, the `allowed_amount` and `paid_amount` fields were generated as completely independent random variables:
```python
claims['allowed_amount'] = np.round(np.random.uniform(50, 5000, n_claims), 2)
claims['paid_amount'] = np.round(np.random.uniform(20, 4000, n_claims), 2)
```

Because the variables were unlinked, roughly 39% of the generated records resulted in a scenario where the simulated Medicare payout was mathematically higher than the total allowed billed amount. 

In the real world, this mirrors an upstream vendor error, an ingestion bug, or an EDI file misinterpretation where claim payment fields are accidentally swapped or multiplied.

## 3. Resolution
The root cause was isolated to the upstream data provider (in this case, our synthetic Python script). The data generation logic was refactored so that `paid_amount` is always a dependent fraction (between 0% and 100%) of the `allowed_amount`:

```python
# Refactored generation logic
payout_ratio = np.random.uniform(0.0, 1.0, n_claims)
claims['paid_amount'] = np.round(claims['allowed_amount'] * payout_ratio, 2)
```

By substituting the malformed `claim.csv` with the mathematically sound file, the test suite passes (12/12) and the pipeline successfully exports the flat API to the React frontend. 

## 4. Lessons Learned & Preventative Measures
* **The Value of Custom SQL Tests:** Standard YAML tests (`not_null`, `unique`) all passed perfectly. This incident proves that generic schema tests are insufficient for healthcare data. Domain-specific logic tests are strictly required to protect the beneficiary experience.
* **Circuit Breaker Validation:** The pipeline orchestration (simulating Argo/Airflow) successfully aborted the run upon test failure. This prevented the "View Recent Claims" UI from rendering confusing negative balances to the end user, which would have likely triggered an influx of tier-1 support center calls.