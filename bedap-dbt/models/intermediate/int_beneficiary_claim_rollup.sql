{{ config(materialized='view') }}

with claims as (
    select * from {{ ref('stg_medicare__claim') }}
)

select
    beneficiary_id,
    count(claim_id) as claims_12m,
    round(avg(allowed_amount), 2) as avg_claim_cost,
    max(claim_date) as last_claim_date
from claims
-- We simulate "current_date" as a fixed point for the synthetic data, 
-- or use actual current_date depending on your warehouse dialect.
where claim_date >= current_date - interval 12 month
group by 1
