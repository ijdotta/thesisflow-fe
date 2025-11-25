/**
 * Parse a date string in ISO 8601 format (YYYY-MM-DD) without timezone conversion.
 * This is crucial for LocalDate values from the backend that should not be
 * interpreted with timezone offset.
 * 
 * @param dateString - ISO date string (e.g., "2023-12-25")
 * @returns Date object in UTC time (prevents timezone offset issues)
 */
export function parseLocalDate(dateString: string): Date {
  // Split the date string to get components
  const [year, month, day] = dateString.split('-').map(Number);
  // Create date in UTC to avoid timezone offset interpretation
  return new Date(Date.UTC(year, month - 1, day));
}

/**
 * Format a date string to Spanish locale format.
 * Handles both Date objects and ISO date strings.
 * 
 * @param dateInput - Date object or ISO date string
 * @returns Formatted date string (e.g., "25/12/2023")
 */
export function formatToLocaleDateString(dateInput: string | Date): string {
  const date = typeof dateInput === 'string' ? parseLocalDate(dateInput) : dateInput;
  return date.toLocaleDateString('es-ES');
}

/**
 * Get the year from a date string or Date object.
 * 
 * @param dateInput - Date object or ISO date string
 * @returns Year as number
 */
export function getYear(dateInput: string | Date): number {
  const date = typeof dateInput === 'string' ? parseLocalDate(dateInput) : dateInput;
  return date.getUTCFullYear();
}
