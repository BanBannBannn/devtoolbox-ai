# UUID Generator Test Cases

## TC-001: Generate one UUID v4
Input:
- Count: `1`
- Uppercase: `false`

Expected:
- Output contains one UUID.
- UUID matches v4 format.

## TC-002: Generate multiple UUIDs
Input:
- Count: `3`
- Uppercase: `false`

Expected:
- Output contains three UUIDs.
- Each UUID matches v4 format.

## TC-003: Uppercase option works
Input:
- Count: `1`
- Uppercase: `true`

Expected:
- Output contains one UUID.
- UUID matches uppercase v4 format.

## TC-004: Count below min falls back to 1
Input:
- Count: `0`
- Uppercase: `false`

Expected:
- Output contains one UUID.

## TC-005: Count above max caps at 100
Input:
- Count: `101`
- Uppercase: `false`

Expected:
- Output contains 100 UUIDs.
