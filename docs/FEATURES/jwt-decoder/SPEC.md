# JWT Decoder SPEC

## Goal
Build a browser-based decoder that reads JWT header and payload data without verifying or signing tokens.

## URL
`/tools/jwt-decoder`

## User Story
As a developer, I want to decode a JWT, so that I can inspect its header, payload, signature string, and common timestamp claims during debugging.

## Functional Requirements
- User can paste a JWT string.
- Tool decodes the Base64URL header safely.
- Tool decodes the Base64URL payload safely.
- Tool returns the signature segment when present.
- Tool extracts common timestamp claims when present:
  - `exp`
  - `iat`
  - `nbf`
- Tool does not verify the JWT signature.
- Tool does not sign or generate JWTs.
- Tool runs fully in the browser.

## Logic Requirements
- Create a pure function named `decodeJwt`.
- Function accepts a JWT string.
- Function returns a typed result object:
  - `success: true` with decoded `header`, decoded `payload`, `signature`, and `timestamps`
  - `success: false` with an `error` message

## Edge Cases
- Empty input.
- Malformed token with fewer than two parts.
- Invalid Base64URL header.
- Invalid Base64URL payload.
- Header or payload that is not valid JSON.
- Tokens with timestamp claims.

## Acceptance Criteria
- Valid JWT header and payload decode successfully.
- Empty input returns a helpful error.
- Malformed token with fewer than two parts returns a helpful error.
- Invalid Base64URL or JSON returns a helpful error.
- `exp`, `iat`, and `nbf` are extracted when present.
- No backend, database, auth, external API, JWT verification, signing, or generation is required.
