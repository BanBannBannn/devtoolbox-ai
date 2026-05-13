# JSON Formatter Test Cases

## TC-001: Format simple object
Input:
```json
{"name":"Ban"}
```

Expected:
```json
{
  "name": "Ban"
}
```

## TC-002: Format array
Input:
```json
[{"id":1},{"id":2}]
```

Expected:
```json
[
  {
    "id": 1
  },
  {
    "id": 2
  }
]
```

## TC-003: Reject invalid JSON
Input:
```json
{"name":}
```

Expected:
- Result is not successful.
- Error contains "Invalid JSON".

## TC-004: Handle empty input
Input:
```txt

```

Expected:
- Result is not successful.
- Error contains "Please enter JSON".

## TC-005: Format nested object
Input:
```json
{"user":{"name":"Ban","skills":["Next.js","AI"]}}
```

Expected:
```json
{
  "user": {
    "name": "Ban",
    "skills": [
      "Next.js",
      "AI"
    ]
  }
}
```

## TC-006: Trim whitespace
Input:
```json
   {"ok":true}   
```

Expected:
```json
{
  "ok": true
}
```
