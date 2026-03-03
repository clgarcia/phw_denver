// Utility functions for managing additional dates

export interface DateWithTime {
  date: string;
  time?: string;
  startTime?: string;
  endTime?: string;
}

export function parseAdditionalDates(jsonString: string | null | undefined): DateWithTime[] {
  if (!jsonString) return [];
  try {
    const parsed = JSON.parse(jsonString);
    if (Array.isArray(parsed)) {
      return parsed.map((item: any) => {
        if (typeof item === 'string') {
          // Legacy format: just a date string
          return { date: item };
        }
        return item;
      });
    }
    return [];
  } catch {
    return [];
  }
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatTime(timeString: string): string {
  if (!timeString) return '';
  try {
    const [hours, minutes] = timeString.split(':').map(Number);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  } catch {
    return timeString;
  }
}
