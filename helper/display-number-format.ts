export const formatNumberForDisplay = (value: string | number): string => {
  if (value === "" || value === 0) return "";

  const numValue = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(numValue)) return "";

  // If the number is a whole number (ends with .00), return as integer string
  if (numValue % 1 === 0) {
    return numValue.toString();
  }
  // Otherwise return the number as string with decimals
  return numValue.toString();
};
