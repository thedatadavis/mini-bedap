-- models/marts/medicare__engagement_log.sql
{{
    config(
        materialized='table',
        tags=['bedap', 'drill_down', 'behavioral']
    )
}}

with events as (
    select * from {{ ref('stg_medicare__account_event') }}
),

ranked_events as (
    select
        event_id,
        beneficiary_id,
        event_type,
        event_timestamp,
        user_agent,
        -- Window function to look at the previous action
        lag(event_timestamp) over (
            partition by beneficiary_id
            order by event_timestamp
        ) as previous_event_timestamp
    from events
)

select
    event_id,
    beneficiary_id,
    event_type,
    event_timestamp,
    user_agent,
    
    -- Map raw events to UI-friendly categories for filtering
    case
        when event_type in ('login') then 'Authentication'
        when event_type in ('view_claims', 'view_coverage') then 'Self-Service Navigation'
        when event_type = 'message_read' then 'Communication'
        else 'Other'
    end as event_category,
    
    -- Session analytics: calculate days since their last action
    -- (Syntax varies by warehouse; this is standard ANSI/DuckDB style)
    date_diff('day', cast(previous_event_timestamp as date), cast(event_timestamp as date)) as days_since_last_event

from ranked_events
