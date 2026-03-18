-- tests/assert_no_future_events.sql
-- This test flags any events with a timestamp in the future.

select
    event_id,
    beneficiary_id,
    event_timestamp
from {{ ref('medicare__engagement_log') }}
where event_timestamp > current_timestamp
