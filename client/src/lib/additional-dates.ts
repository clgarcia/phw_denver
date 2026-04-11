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
  // Parse date string as YYYY-MM-DD format to avoid timezone issues
  // This ensures the date is treated as local time, not UTC
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatTime(timeString: string): string {
  if (!timeString) return '';
  try {
    // Handle both HHMM and HH:MM formats
    const cleaned = timeString.replace(':', '');
    
    if (cleaned.length === 4) {
      const hours = cleaned.substring(0, 2);
      const minutes = cleaned.substring(2, 4);
      return `${hours}:${minutes}`;
    }
    
    // Fallback to original format if not 4 digits
    const [hoursPart, minutesPart] = timeString.split(':').map(Number);
    return `${hoursPart.toString().padStart(2, '0')}:${minutesPart.toString().padStart(2, '0')}`;
  } catch {
    return timeString;
  }
}

export function getEventDateDisplay(event: any): { label: string; display: string } {
  // Check which mode the event uses
  if (event.dateRangeMode && event.dateRangeStart && event.dateRangeEnd) {
    // Date range mode
    const rangeDisplay = `${formatDate(event.dateRangeStart)} - ${formatDate(event.dateRangeEnd)}`;
    return { label: 'Date Range', display: rangeDisplay };
  } else if (event.additionalDates) {
    // Multiple dates mode
    try {
      const parsed = parseAdditionalDates(event.additionalDates);
      if (parsed.length > 0) {
        return { label: 'Multiple Dates', display: 'Multiple dates' };
      }
    } catch {
      // Fall through to single date
    }
  }
  
  // Single date mode (default)
  const dateDisplay = formatDate(event.date);
  return { label: 'Date', display: dateDisplay };
}
