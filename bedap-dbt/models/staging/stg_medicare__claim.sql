-- bedap-dbt/models/staging/stg_medicare__claim.sql
{{ config(materialized='view') }}

with source as (
    select * from {{ ref('claim') }}
)

select
    cast(claim_id as varchar) as claim_id,
    cast(beneficiary_id as varchar) as beneficiary_id,
    cast(claim_date as date) as claim_date,
    cast(provider_npi as varchar) as provider_npi,
    cast(service_code as varchar) as service_code,
    cast(allowed_amount as decimal(10,2)) as allowed_amount,
    cast(paid_amount as decimal(10,2)) as paid_amount
from source
