-- models/marts/medicare__claim_details.sql
{{
    config(
        materialized='table',
        tags=['bedap', 'drill_down', 'financials']
    )
}}

with claims as (
    select * from {{ ref('stg_medicare__claim') }}
),

-- In a real project, this would be a seed file of HCPCS/CPT codes.
-- We use a CTE here to simulate joining dimension data.
service_categories as (
    select '99213' as service_code, 'Office Visit (Level 3)' as service_description, 'Evaluation & Management' as category union all
    select '99214' as service_code, 'Office Visit (Level 4)' as service_description, 'Evaluation & Management' as category union all
    select 'G0402' as service_code, 'Initial Preventive Physical Exam' as service_description, 'Preventative' as category union all
    select 'Q2041' as service_code, 'Influenza Virus Vaccine' as service_description, 'Preventative' as category
)

select
    c.claim_id,
    c.beneficiary_id,
    c.claim_date,
    c.provider_npi,
    c.service_code,
    coalesce(s.service_description, 'Unknown Service') as service_description,
    coalesce(s.category, 'Other') as service_category,
    
    -- Financials
    c.allowed_amount,
    c.paid_amount as medicare_paid_amount,
    
    -- Calculate beneficiary out-of-pocket responsibility
    round(cast((c.allowed_amount - c.paid_amount) as numeric), 2) as beneficiary_responsibility_amount,
    
    -- UI Helper Flags for the frontend
    case when (c.allowed_amount - c.paid_amount) > 0 then true else false end as requires_payment_flag

from claims c
left join service_categories s 
    on c.service_code = s.service_code
