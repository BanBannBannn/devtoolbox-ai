const isoDatePattern = /^(\d{4})-(\d{2})-(\d{2})$/;
const millisecondsPerDay = 24 * 60 * 60 * 1000;

type DateParts = {
  year: number;
  month: number;
  day: number;
};

export function addDaysToDate(date: string, days: number): string {
  validateWholeNumber(days, "days");

  const parsedDate = parseIsoDate(date);
  const utcDate = toUtcDate(parsedDate);
  utcDate.setUTCDate(utcDate.getUTCDate() + days);

  return formatIsoDate(utcDate);
}

export function addMonthsToDate(date: string, months: number): string {
  validateWholeNumber(months, "months");

  const parsedDate = parseIsoDate(date);
  const targetMonthIndex = parsedDate.month - 1 + months;
  const targetYear = parsedDate.year + Math.floor(targetMonthIndex / 12);
  const normalizedMonthIndex = modulo(targetMonthIndex, 12);
  const targetMonth = normalizedMonthIndex + 1;
  const targetDay = Math.min(
    parsedDate.day,
    getDaysInMonth(targetYear, targetMonth),
  );

  return formatIsoDateFromParts({
    year: targetYear,
    month: targetMonth,
    day: targetDay,
  });
}

export function addYearsToDate(date: string, years: number): string {
  validateWholeNumber(years, "years");

  const parsedDate = parseIsoDate(date);
  const targetYear = parsedDate.year + years;
  const targetDay = Math.min(
    parsedDate.day,
    getDaysInMonth(targetYear, parsedDate.month),
  );

  return formatIsoDateFromParts({
    year: targetYear,
    month: parsedDate.month,
    day: targetDay,
  });
}

export function daysBetweenDates(startDate: string, endDate: string): number {
  const start = toUtcDate(parseIsoDate(startDate));
  const end = toUtcDate(parseIsoDate(endDate));

  return Math.round((end.getTime() - start.getTime()) / millisecondsPerDay);
}

function parseIsoDate(date: string): DateParts {
  const match = isoDatePattern.exec(date.trim());

  if (!match) {
    throw new Error("Invalid date. Use YYYY-MM-DD format.");
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (month < 1 || month > 12) {
    throw new Error("Invalid date. Month must be between 01 and 12.");
  }

  const daysInMonth = getDaysInMonth(year, month);

  if (day < 1 || day > daysInMonth) {
    throw new Error("Invalid date. Day is not valid for the given month.");
  }

  return { year, month, day };
}

function validateWholeNumber(value: number, label: string) {
  if (!Number.isFinite(value) || !Number.isInteger(value)) {
    throw new Error(`Invalid ${label}. Use a whole number.`);
  }
}

function toUtcDate(date: DateParts): Date {
  return new Date(Date.UTC(date.year, date.month - 1, date.day));
}

function formatIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatIsoDateFromParts(date: DateParts): string {
  return formatIsoDate(toUtcDate(date));
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function modulo(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor;
}
