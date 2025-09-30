/**
 * Safely parses a date string in YYYY-MM-DD format as a local date
 * to avoid timezone conversion issues.
 *
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Date object or null if invalid
 */
export function parseDateSafely(dateString: string): Date | null {
  if (!dateString || typeof dateString !== "string") {
    return null;
  }

  const parts = dateString.split("-");
  if (parts.length !== 3) {
    return null;
  }

  const [yearStr, monthStr, dayStr] = parts;
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  // Validate the parsed values
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    return null;
  }

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  // Create date as local date (month is 0-indexed in Date constructor)
  return new Date(year, month - 1, day);
}

/**
 * Formats a date string in YYYY-MM-DD format to a localized string
 * without timezone conversion issues.
 *
 * @param dateString - Date string in YYYY-MM-DD format
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string or empty string if invalid
 */
export function formatDateSafely(
  dateString: string,
  options: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric",
    year: "numeric",
  }
): string {
  const date = parseDateSafely(dateString);
  if (!date) {
    return "";
  }

  return date.toLocaleDateString("en-US", options);
}
