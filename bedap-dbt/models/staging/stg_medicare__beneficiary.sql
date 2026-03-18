{{ config(materialized='view') }}

with source as (
    select * from {{ ref('beneficiary') }}
)

select
    cast(beneficiary_id as integer) as beneficiary_id,
    cast(first_name as varchar) as first_name,
    cast(last_name as varchar) as last_name,
    cast(dob as date) as dob,
    cast(gender as varchar) as gender,
    cast(zip_code as varchar) as zip_code,
    cast(plan_type as varchar) as plan_type,
    cast(chronic_conditions as integer) as chronic_conditions
from source
