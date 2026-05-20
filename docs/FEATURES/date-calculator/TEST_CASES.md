# Date Calculator Test Cases

## TC-001: 30 days from a fixed date
Input:
- Date: `2026-01-01`
- Days: `30`

Expected:
- Output is `2026-01-31`.

## TC-002: Subtract days
Input:
- Date: `2026-01-10`
- Days: `-5`

Expected:
- Output is `2026-01-05`.

## TC-003: Add months
Input:
- Date: `2026-01-15`
- Months: `2`

Expected:
- Output is `2026-03-15`.

## TC-004: Add years
Input:
- Date: `2024-02-29`
- Years: `1`

Expected:
- Output is `2025-02-28`.

## TC-005: Calculate days between two dates
Input:
- Start date: `2026-01-01`
- End date: `2026-01-31`

Expected:
- Output is `30`.

## TC-006: Handle invalid date input
Input:
- Date: `not-a-date`

Expected:
- Function throws a helpful invalid date error.
