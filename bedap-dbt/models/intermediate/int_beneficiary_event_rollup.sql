{{ config(materialized='view') }}

with events as (
    select * from {{ ref('stg_medicare__account_event') }}
)

select
    beneficiary_id,
    -- Count distinct login events
    count(distinct case when event_type = 'login' then event_id end) as logins_90d,
    max(event_timestamp) as last_interaction
from events
where event_timestamp >= current_timestamp - interval 90 day
group by 1
