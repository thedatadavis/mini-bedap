{{
    config(
        materialized='table',
        tags=['bedap', 'dashboard']
    )
}}

with beneficiary as (
    select * from {{ ref('stg_medicare__beneficiary') }}
),

claim_rollup as (
    select * from {{ ref('int_beneficiary_claim_rollup') }}
),

event_rollup as (
    select * from {{ ref('int_beneficiary_event_rollup') }}
)

select
    b.beneficiary_id,
    concat(b.first_name, ' ', b.last_name) as beneficiary_name,
    b.dob,
    b.plan_type,
    b.chronic_conditions,
    
    coalesce(c.claims_12m, 0) as claims_12m,
    coalesce(c.avg_claim_cost, 0.0) as avg_claim_cost,
    c.last_claim_date,
    
    coalesce(e.logins_90d, 0) as logins_90d,
    e.last_interaction

from beneficiary b
left join claim_rollup c 
    on b.beneficiary_id = c.beneficiary_id
left join event_rollup e 
    on b.beneficiary_id = e.beneficiary_id