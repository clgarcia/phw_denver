/**
 * Format time string in HH:mm format to military time (24-hour format)
 * For example: "14:30" -> "14:30" or "13:00" -> "13:00"
 */
export function formatTimeToMilitary(timeString: string): string {
  if (!timeString) return '';
  try {
    const [hours, minutes] = timeString.split(':').map(Number);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  } catch {
    return timeString;
  }
}
