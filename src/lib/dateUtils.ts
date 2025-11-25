/**
 * Format a date string (YYYY-MM-DD) to Spanish locale format without parsing.
 * Avoids timezone offset issues by treating the string directly.
 * 
 * @param dateString - ISO date string (e.g., "2023-12-25")
 * @returns Formatted date string (e.g., "25/12/2023")
 */
export function formatToLocaleDateString(dateString: string): string {
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

/**
 * Get the year from a date string (YYYY-MM-DD).
 * 
 * @param dateString - ISO date string (e.g., "2023-12-25")
 * @returns Year as number
 */
export function getYear(dateString: string): number {
  return parseInt(dateString.split('-')[0], 10);
}
