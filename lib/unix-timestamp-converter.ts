export type TimestampUnit = "seconds" | "milliseconds";

export type TimestampToDateResult =
  | {
      success: true;
      date: string;
    }
  | {
      success: false;
      error: string;
    };

export type DateToTimestampResult =
  | {
      success: true;
      timestamp: number;
    }
  | {
      success: false;
      error: string;
    };

export function timestampToDate(
  timestamp: string,
  unit: TimestampUnit,
): TimestampToDateResult {
  const trimmedTimestamp = timestamp.trim();

  if (!trimmedTimestamp) {
    return {
      success: false,
      error: "Invalid timestamp. Please enter a Unix timestamp.",
    };
  }

  const numericTimestamp = Number(trimmedTimestamp);

  if (!Number.isFinite(numericTimestamp)) {
    return {
      success: false,
      error: "Invalid timestamp. Use a numeric Unix timestamp.",
    };
  }

  const milliseconds =
    unit === "seconds" ? numericTimestamp * 1000 : numericTimestamp;
  const date = new Date(milliseconds);

  if (Number.isNaN(date.getTime())) {
    return {
      success: false,
      error: "Invalid timestamp. The value is outside the supported date range.",
    };
  }

  return {
    success: true,
    date: date.toISOString(),
  };
}

export function dateToTimestamp(
  dateInput: string,
  unit: TimestampUnit,
): DateToTimestampResult {
  const trimmedDate = dateInput.trim();

  if (!trimmedDate) {
    return {
      success: false,
      error: "Invalid date. Please enter a date or ISO date/time.",
    };
  }

  const date = new Date(trimmedDate);
  const milliseconds = date.getTime();

  if (Number.isNaN(milliseconds)) {
    return {
      success: false,
      error: "Invalid date. Use a valid date or ISO date/time.",
    };
  }

  return {
    success: true,
    timestamp:
      unit === "seconds" ? Math.floor(milliseconds / 1000) : milliseconds,
  };
}
