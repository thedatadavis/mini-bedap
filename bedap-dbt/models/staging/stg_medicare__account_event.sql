{{ config(materialized='view') }}

with source as (
    select * from {{ ref('account_event') }}
)

select
    cast(event_id as integer) as event_id,
    cast(beneficiary_id as integer) as beneficiary_id,
    cast(event_type as varchar) as event_type,
    cast(event_timestamp as timestamp) as event_timestamp,
    cast(user_agent as varchar) as user_agent
from source
