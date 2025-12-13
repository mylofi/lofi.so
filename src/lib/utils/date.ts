// Utility functions for timezone-aware date formatting

export interface EventDate {
  date: string;
  time: string;
  timezone: string;
}

export const TIMEZONE_OFFSETS = {
  'PST': -480, // UTC-8
  'PDT': -420, // UTC-7
  'EST': -300, // UTC-5
  'EDT': -240, // UTC-4
  'CST': -360, // UTC-6
  'CDT': -300, // UTC-5
  'MST': -420, // UTC-7
  'MDT': -360, // UTC-6
  'UTC': 0
} as const;

export const getTimezoneOffset = (timezone: string): number =>
  TIMEZONE_OFFSETS[timezone as keyof typeof TIMEZONE_OFFSETS] ?? 0;

export const createEventDateTime = (eventDate: string, time: string): Date =>
  new Date(`${eventDate}T${time}:00`);

export const adjustDateForTimezone = (date: Date, timezone: string): Date => {
  const eventTimezoneOffset = getTimezoneOffset(timezone);
  const localOffset = date.getTimezoneOffset();
  const utcTime = date.getTime() - (localOffset * 60000);
  const eventLocalTime = utcTime + (eventTimezoneOffset * 60000);
  return new Date(eventLocalTime);
};

export const formatEventDate = (event: EventDate | null): string => {
  if (!event?.date || !event?.time || !event?.timezone) {
    return '';
  }

  try {
    // Parse date as local time to avoid timezone shifting
    const [year, month, day] = event.date.split('-').map(Number);
    const [hours, minutes] = event.time.split(':').map(Number);
    const eventDate = new Date(year, month - 1, day, hours, minutes);

    return eventDate.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  } catch (error) {
    console.warn('Error formatting event date:', error);
    return '';
  }
};