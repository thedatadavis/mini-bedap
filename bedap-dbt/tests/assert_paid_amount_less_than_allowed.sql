-- tests/assert_paid_amount_less_than_allowed.sql
-- This test ensures Medicare never pays more than the total allowed amount.

select
    claim_id,
    allowed_amount,
    medicare_paid_amount
from {{ ref('medicare__claim_detail') }}
where medicare_paid_amount > allowed_amount
