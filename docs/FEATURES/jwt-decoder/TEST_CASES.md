# JWT Decoder Test Cases

## TC-001: Decode valid JWT header and payload
Input:
- JWT with valid Base64URL JSON header and payload.

Expected:
- Result has `success: true`.
- Header object is decoded.
- Payload object is decoded.
- Signature string is returned.

## TC-002: Reject empty input
Input:
- Empty string.

Expected:
- Result has `success: false`.
- Error message asks for a JWT.

## TC-003: Reject malformed token with fewer than 2 parts
Input:
- Token with only one segment.

Expected:
- Result has `success: false`.
- Error message explains the token format is invalid.

## TC-004: Handle invalid Base64URL or JSON
Input:
- Token with invalid Base64URL or decoded content that is not JSON.

Expected:
- Result has `success: false`.
- Error message explains the token could not be decoded.

## TC-005: Extract timestamp claims
Input:
- Valid JWT payload with `exp`, `iat`, and `nbf`.

Expected:
- Result has `success: true`.
- `timestamps.exp`, `timestamps.iat`, and `timestamps.nbf` are present.
