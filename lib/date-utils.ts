/**
 * Convert date from YYYY-MM-DD format (backend) to MM/DD/YYYY format (display)
 */
export function convertDateForDisplay(dateStr: string): string {
  if (!dateStr) return "";

  // Remove time part if present (e.g., "2023-03-15T00:00:00.000Z" -> "2023-03-15")
  const datePart = dateStr.split("T")[0];

  if (datePart.includes("-")) {
    // YYYY-MM-DD format - convert to MM/DD/YYYY
    const [year, month, day] = datePart.split("-");
    return `${month}/${day}/${year}`;
  }

  // Already in MM/DD/YYYY format or other format
  return datePart;
}

/**
 * Convert date from MM/DD/YYYY format (display) to YYYY-MM-DD format (backend)
 */
export function convertDateForSubmission(dateStr: string): string {
  if (!dateStr) return dateStr;

  if (dateStr.includes("/")) {
    // MM/DD/YYYY format - convert to YYYY-MM-DD
    const [month, day, year] = dateStr.split("/");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  // Already in YYYY-MM-DD format or other format
  return dateStr;
}
