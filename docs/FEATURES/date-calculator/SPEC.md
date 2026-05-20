# Date Calculator SPEC

## Goal
Build a browser-based date calculator that can add or subtract days, months, and years, and calculate the number of days between two dates.

## URL
`/tools/date-calculator`

## User Story
As a developer, student, or planner, I want to calculate dates and date differences, so that I can quickly work with deadlines, schedules, and test data.

## Functional Requirements
- User can enter a start date.
- User can add or subtract days.
- User can add or subtract months.
- User can add or subtract years.
- User can calculate days between two dates.
- Tool returns ISO date strings in `YYYY-MM-DD` format where appropriate.
- Tool handles invalid date input with a clear error.
- Tool runs fully in the browser.

## Logic Requirements
- Create pure functions:
  - `addDaysToDate(date, days)`
  - `addMonthsToDate(date, months)`
  - `addYearsToDate(date, years)`
  - `daysBetweenDates(startDate, endDate)`
- Date inputs use `YYYY-MM-DD`.
- Date outputs use `YYYY-MM-DD` where a date is returned.
- Date math should avoid timezone drift.

## Edge Cases
- Invalid date input.
- Negative day, month, or year offsets.
- Month changes near month ends.
- Leap years.
- End date before start date.

## Acceptance Criteria
- Adding days returns the expected ISO date.
- Subtracting days returns the expected ISO date.
- Adding months returns the expected ISO date.
- Adding years returns the expected ISO date.
- Days between two valid dates returns a number.
- Invalid date input produces a helpful error.
- No backend, database, auth, or external API is required.
