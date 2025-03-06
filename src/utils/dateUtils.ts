/**
 * Date utility functions for the application
 */

/**
 * Formats a date string into a more readable format
 * @param dateString - The date string to format (YYYY-MM-DD)
 * @returns Formatted date string (e.g., "March 15, 2023")
 */
export function formatDate(dateString: string): string {
  if (!dateString) return 'Date not available';
  
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString; // Return the original string if there's an error
  }
} 