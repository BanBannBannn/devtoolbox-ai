---
title: "What Is a Unix Timestamp?"
description: "Learn what Unix timestamps are, the difference between seconds and milliseconds, and how to convert them to readable dates."
date: "2026-05-20"
tags: ["Timestamps", "Dates", "Unix"]
slug: "what-is-a-unix-timestamp"
---

A Unix timestamp is a number that represents a moment in time. It counts how much time has passed since January 1, 1970 at 00:00:00 UTC.

Developers use Unix timestamps because numbers are easy for computers to store, compare, sort, and send through APIs.

## Seconds vs milliseconds

Unix timestamps often appear in seconds or milliseconds.

```txt
1700000000     seconds
1700000000000  milliseconds
```

If a timestamp looks too large, it may be in milliseconds. If the converted date looks far in the future, try switching units.

Use the [Unix Timestamp Converter](/tools/unix-timestamp-converter) to convert both formats.

## Why timestamps are useful

- Store event times in logs.
- Compare expiration dates.
- Sort records by creation time.
- Send dates through APIs.
- Debug authentication tokens and scheduled jobs.

## Example conversion

```txt
1700000000 seconds
2023-11-14T22:13:20.000Z
```

The exact local time can differ by timezone, but the UTC moment is the same.

## Common timestamp mistakes

- Mixing seconds and milliseconds.
- Forgetting that Unix timestamps are based on UTC.
- Treating a timestamp as local time too early.
- Comparing strings instead of numbers.

## Related tools

- [Unix Timestamp Converter](/tools/unix-timestamp-converter)
- [Date Calculator](/tools/date-calculator)
- [JWT Decoder](/tools/jwt-decoder)

## FAQ

### Is a Unix timestamp always UTC?

Yes. The timestamp represents a UTC-based moment, even if you display it in local time.

### Why do some APIs use milliseconds?

JavaScript dates use milliseconds internally, so many JavaScript APIs and services expose millisecond timestamps.

### Can timestamps be negative?

Yes. Negative timestamps represent dates before January 1, 1970 UTC.
