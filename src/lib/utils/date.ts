// Minimal helpers: use startTimeISO as source of truth, fall back to date/time

export interface EventDate {
	startTimeISO?: string;
	date?: string;
	time?: string;
	timezone?: string;
}

const parseYMDAsLocalDate = (dateStr: string): Date | null => {
	const [year, month, day] = dateStr.split('-').map(Number);
	if (!year || !month || !day) return null;
	const date = new Date(year, month - 1, day);
	return isNaN(date.getTime()) ? null : date;
};

export const formatYMDLong = (dateStr: string): string => {
	const date = parseYMDAsLocalDate(dateStr);
	if (!date) return '';
	const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
	const monthName = date.toLocaleDateString('en-US', { month: 'long' });
	const dayNum = date.getDate();
	const yearNum = date.getFullYear();
	return `${weekday}, ${monthName} ${dayNum} ${yearNum}`;
};

export const formatHHMM12 = (timeStr: string): string => {
	const [hours, minutes] = timeStr.split(':');
	const hour = parseInt(hours);
	const minute = parseInt(minutes);
	const ampm = hour >= 12 ? 'PM' : 'AM';
	const hour12 = hour % 12 || 12;
	const minuteStr = Number.isNaN(minute) ? '00' : minute.toString().padStart(2, '0');
	return `${hour12}:${minuteStr}${ampm}`;
};

const toDate = (event?: EventDate | null): Date | null => {
	if (!event) return null;
	if (event.startTimeISO) {
		const parsed = new Date(event.startTimeISO);
		return isNaN(parsed.getTime()) ? null : parsed;
	}
	if (event.date) {
		const t = event.time ?? '00:00';
		const fallback = new Date(`${event.date}T${t}`);
		return isNaN(fallback.getTime()) ? null : fallback;
	}
	return null;
};

export const formatEventDate = (event: EventDate | null): string => {
	const date = toDate(event);
	if (!date) return '';
	return date.toLocaleDateString('en-US', {
		weekday: 'short',
		day: 'numeric',
		month: 'short'
	});
};
export const tzOffsetMap: Record<string, string> = {
	PST: '-08:00',
	PDT: '-07:00',
	EST: '-05:00',
	EDT: '-04:00',
	CST: '-06:00',
	CDT: '-05:00',
	MST: '-07:00',
	MDT: '-06:00',
	UTC: '+00:00',
	GMT: '+00:00'
};

export const buildStartTimeISO = (date: string, time: string, timezone?: string): string => {
	const offset = timezone ? tzOffsetMap[timezone.toUpperCase()] : undefined;
	const suffix = offset ?? 'Z';
	return `${date}T${time}:00${suffix}`;
};