# Unix Timestamp Converter Test Cases

## TC-001: Convert seconds timestamp to date
Input:
- Timestamp: `1700000000`
- Unit: `seconds`

Expected:
- Output date is `2023-11-14T22:13:20.000Z`.

## TC-002: Convert milliseconds timestamp to date
Input:
- Timestamp: `1700000000000`
- Unit: `milliseconds`

Expected:
- Output date is `2023-11-14T22:13:20.000Z`.

## TC-003: Convert date to seconds timestamp
Input:
- Date: `2023-11-14T22:13:20.000Z`
- Unit: `seconds`

Expected:
- Output timestamp is `1700000000`.

## TC-004: Convert date to milliseconds timestamp
Input:
- Date: `2023-11-14T22:13:20.000Z`
- Unit: `milliseconds`

Expected:
- Output timestamp is `1700000000000`.

## TC-005: Handle invalid timestamp
Input:
- Timestamp: `not-a-number`

Expected:
- Result has `success: false`.
- Error message explains the timestamp is invalid.

## TC-006: Handle invalid date
Input:
- Date: `not-a-date`

Expected:
- Result has `success: false`.
- Error message explains the date is invalid.
