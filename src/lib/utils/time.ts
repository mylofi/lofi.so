
/** All LoFi meetups default to Pacific time (handles PST ↔ PDT automatically) */
export const EVENT_TZ = 'America/Los_Angeles';

/** IANA timezone options for the event form */
export const TIMEZONE_OPTIONS = [
	{ value: 'America/Los_Angeles', label: 'Pacific' },
	{ value: 'America/Denver', label: 'Mountain' },
	{ value: 'America/Chicago', label: 'Central' },
	{ value: 'America/New_York', label: 'Eastern' },
	{ value: 'Europe/London', label: 'London' },
	{ value: 'Europe/Berlin', label: 'Central Europe' },
	{ value: 'UTC', label: 'UTC' }
] as const;

/** Get the user's local IANA timezone (e.g. "America/Los_Angeles") */
export function getLocalTimezone(): string {
	return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

// ---------------------------------------------------------------------------
// Internal: extract date parts from a Date in a given timezone
// ---------------------------------------------------------------------------

function dateParts(d: Date, tz: string) {
	const p = new Intl.DateTimeFormat('en-US', {
		timeZone: tz,
		year: 'numeric',
		month: 'numeric',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
		hour12: false
	}).formatToParts(d);

	const get = (type: string) => parseInt(p.find((x) => x.type === type)?.value ?? '0');
	const hour = get('hour');
	return {
		y: get('year'),
		mo: get('month'),
		d: get('day'),
		h: hour === 24 ? 0 : hour,
		mi: get('minute')
	};
}

// ---------------------------------------------------------------------------
// Conversion
// ---------------------------------------------------------------------------

/** Convert form date + time + IANA timezone to Unix seconds */
export function toUnixTime(dateStr: string, timeStr: string, tz: string = EVENT_TZ): number {
	const [y, mo, d] = dateStr.split('-').map(Number);
	const [h, mi] = timeStr.split(':').map(Number);

	// Treat the wall-clock numbers as if they were UTC
	const utcGuessMs = Date.UTC(y, mo - 1, d, h, mi, 0);

	// Find how far the target tz is from UTC at that approximate instant
	const ref = new Date(utcGuessMs);
	const utcP = dateParts(ref, 'UTC');
	const tzP = dateParts(ref, tz);
	const utcRef = Date.UTC(utcP.y, utcP.mo - 1, utcP.d, utcP.h, utcP.mi);
	const tzRef = Date.UTC(tzP.y, tzP.mo - 1, tzP.d, tzP.h, tzP.mi);
	const offsetMs = utcRef - tzRef; // positive = tz behind UTC (e.g. +7h for PDT)

	return Math.floor((utcGuessMs + offsetMs) / 1000);
}

/** Convert Unix seconds to form-friendly date + time strings in a given timezone */
export function fromUnixTime(
	ts: number,
	tz: string = EVENT_TZ
): { date: string; time: string } {
	const d = new Date(ts * 1000);
	// en-CA locale gives YYYY-MM-DD format natively
	const date = d.toLocaleDateString('en-CA', { timeZone: tz });
	const time = d.toLocaleTimeString('en-GB', {
		timeZone: tz,
		hour: '2-digit',
		minute: '2-digit',
		hour12: false
	});
	return { date, time };
}
