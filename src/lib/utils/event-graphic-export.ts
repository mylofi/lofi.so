import JSZip from 'jszip';
import { domToPng } from 'modern-screenshot';
import type {
	EventGraphicSpec,
	EventGraphicExportTarget,
	ExportTargetId
} from '$lib/types/event-graphic';
import { getPrimarySocial } from '$lib/utils/event-graphic-spec';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ExportValidation {
	valid: boolean;
	errors: string[];
	warnings: string[];
	sizeBytes: number;
}

export interface ExportResult {
	target: EventGraphicExportTarget;
	blob: Blob;
	filename: string;
	validation: ExportValidation;
	speakerName?: string;
}

export interface ExportManifestArtifact {
	filename: string;
	targetId: ExportTargetId;
	width: number;
	height: number;
	format: string;
	sizeBytes: number;
	sha256: string;
	altText: string;
}

export interface ExportManifest {
	generated: string;
	eventNumber: number;
	artifacts: ExportManifestArtifact[];
}

// ---------------------------------------------------------------------------
// Capture
// ---------------------------------------------------------------------------

export async function captureTarget(
	element: HTMLElement,
	target: EventGraphicExportTarget
): Promise<Blob> {
	const dataUrl = await domToPng(element, {
		width: target.width,
		height: target.height,
		scale: 2,
		quality: 1
	});

	// Convert data URL to blob
	const pngBlob = await dataUrlToBlob(dataUrl);

	// If target format is png, return directly
	if (target.format === 'png') return pngBlob;

	// Convert to jpg/webp via canvas
	return convertFormat(pngBlob, target.format, target.maxBytes);
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
	const res = await fetch(dataUrl);
	return res.blob();
}

async function convertFormat(
	pngBlob: Blob,
	format: 'jpg' | 'webp',
	maxBytes?: number
): Promise<Blob> {
	const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/webp';
	const img = await createImageBitmap(pngBlob);

	const canvas = new OffscreenCanvas(img.width, img.height);
	const ctx = canvas.getContext('2d');
	if (!ctx) throw new Error('Failed to get canvas context');
	ctx.drawImage(img, 0, 0);

	// Iterative quality reduction if byte budget is specified
	let quality = 0.92;
	let blob = await canvas.convertToBlob({ type: mimeType, quality });

	if (maxBytes) {
		while (blob.size > maxBytes && quality > 0.3) {
			quality -= 0.05;
			blob = await canvas.convertToBlob({ type: mimeType, quality });
		}
	}

	return blob;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export function validateExport(
	blob: Blob,
	target: EventGraphicExportTarget
): ExportValidation {
	const errors: string[] = [];
	const warnings: string[] = [];

	if (target.maxBytes && blob.size > target.maxBytes) {
		errors.push(
			`File size ${formatBytes(blob.size)} exceeds ${formatBytes(target.maxBytes)} limit`
		);
	} else if (target.maxBytes && blob.size > target.maxBytes * 0.9) {
		warnings.push(
			`File size ${formatBytes(blob.size)} is close to ${formatBytes(target.maxBytes)} limit`
		);
	}

	return {
		valid: errors.length === 0,
		errors,
		warnings,
		sizeBytes: blob.size
	};
}

function formatBytes(bytes: number): string {
	if (bytes < 1024) return `${bytes}B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

// ---------------------------------------------------------------------------
// Filenames
// ---------------------------------------------------------------------------

function slugify(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '');
}

export function generateFilename(
	spec: EventGraphicSpec,
	target: EventGraphicExportTarget,
	speakerName?: string
): string {
	const ext = target.format === 'jpg' ? 'jpg' : target.format;
	const base = `lofi-${spec.event.number}`;

	if (speakerName) {
		return `${base}-speaker-${slugify(speakerName)}-${target.id}.${ext}`;
	}
	return `${base}-${target.id}.${ext}`;
}

// ---------------------------------------------------------------------------
// SHA256
// ---------------------------------------------------------------------------

async function sha256(blob: Blob): Promise<string> {
	const buffer = await blob.arrayBuffer();
	const hash = await crypto.subtle.digest('SHA-256', buffer);
	return Array.from(new Uint8Array(hash))
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}

// ---------------------------------------------------------------------------
// Manifest
// ---------------------------------------------------------------------------

export async function buildManifest(
	results: ExportResult[],
	spec: EventGraphicSpec
): Promise<ExportManifest> {
	const artifacts: ExportManifestArtifact[] = [];

	for (const r of results) {
		const hash = await sha256(r.blob);
		artifacts.push({
			filename: r.filename,
			targetId: r.target.id,
			width: r.target.width,
			height: r.target.height,
			format: r.target.format,
			sizeBytes: r.validation.sizeBytes,
			sha256: hash,
			altText: buildAltText(spec, r.speakerName)
		});
	}

	return {
		generated: new Date().toISOString(),
		eventNumber: spec.event.number,
		artifacts
	};
}

function buildAltText(spec: EventGraphicSpec, speakerName?: string): string {
	if (speakerName) {
		const speaker = spec.speakers.find((s) => s.name === speakerName);
		return speaker
			? `${speaker.name} speaking at LoFi/${spec.event.number}: ${speaker.talk}`
			: `Speaker card for LoFi/${spec.event.number}`;
	}
	const speakerNames = spec.speakers.map((s) => s.name).join(', ');
	return `LoFi/${spec.event.number} - ${spec.event.title}. Speakers: ${speakerNames}`;
}

// ---------------------------------------------------------------------------
// Captions
// ---------------------------------------------------------------------------

export function buildCaptions(spec: EventGraphicSpec): string {
	const { event, speakers, sponsors } = spec;

	const speakerLines = speakers.map((s, i) => {
		const primary = getPrimarySocial(s);
		const handle = primary ? primary.handle : s.name;
		return `${i + 1}. ${handle} — "${s.talk}"`;
	});

	const sponsorHandles = sponsors.map((s) => s.name).join(', ');
	const rsvpUrl = event.links.registration || event.links.discord;

	// ── X / Bluesky post ──────────────────────────────────────────────────
	// Style: hook line, numbered speaker list, date + RSVP, hashtags
	const xPost = [
		`LoFi/${event.number} — ${event.title} 🎙️`,
		``,
		...speakerLines,
		``,
		`📅 ${event.displayDateTime}`,
		`🔗 ${rsvpUrl}`,
		``,
		`#localfirst #lofi`
	].join('\n');

	// ── Bluesky post ──────────────────────────────────────────────────────
	// Same content, Bluesky handles don't need @ prefix adjustments
	const bskyPost = xPost;

	// ── Discord announcement ───────────────────────────────────────────────
	const discordPost = [
		`**LoFi/${event.number} — ${event.title}**`,
		``,
		`📅 ${event.displayDateTime}`,
		``,
		`**Speakers:**`,
		...speakers.map((s) => {
			const primary = getPrimarySocial(s);
			const handle = primary ? ` (${primary.handle})` : '';
			return `• **${s.name}**${handle} — ${s.talk}`;
		}),
		``,
		`Sponsored by ${sponsorHandles} 🙏`,
		``,
		`RSVP → ${rsvpUrl}`,
	].join('\n');

	// ── LinkedIn post ──────────────────────────────────────────────────────
	const linkedinPost = [
		`Excited to announce LoFi/${event.number} — ${event.title}! 🚀`,
		``,
		`We've got an incredible lineup for this month's Local First Software meetup:`,
		``,
		...speakers.map((s) => {
			const primary = getPrimarySocial(s);
			const handle = primary ? ` (${primary.handle})` : '';
			return `→ ${s.name}${handle}: "${s.talk}"`;
		}),
		``,
		`📅 ${event.displayDateTime}`,
		`🔗 RSVP: ${rsvpUrl}`,
		``,
		`Huge thanks to our sponsors: ${sponsorHandles}`,
		``,
		`#LocalFirst #SoftwareEngineering #LoFi #OfflineFirst`
	].join('\n');

	// ── Full captions doc ──────────────────────────────────────────────────
	return `# LoFi/${event.number} — ${event.title}
_Generated: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}_

---

## 🐦 X Post (copy & paste)

\`\`\`
${xPost}
\`\`\`

---

## 🦋 Bluesky Post (copy & paste)

\`\`\`
${bskyPost}
\`\`\`

---

## 💬 Discord Announcement (copy & paste)

\`\`\`
${discordPost}
\`\`\`

---

## 💼 LinkedIn Post (copy & paste)

\`\`\`
${linkedinPost}
\`\`\`

---

## 📋 Event Details

- **Event:** LoFi/${event.number} — ${event.title}
- **Date:** ${event.displayDateTime}
- **RSVP:** ${rsvpUrl}
- **Discord:** ${event.links.discord}

## 👥 Speakers

${speakers.map((s) => {
	const primary = getPrimarySocial(s);
	const handle = primary ? ` · ${primary.handle}` : '';
	return `### ${s.name}${handle}\n**Talk:** ${s.talk}\n${s.bio ? `**Bio:** ${s.bio}` : ''}`;
}).join('\n\n')}

## 🤝 Sponsors

${sponsors.map((s) => `- [${s.name}](${s.url})`).join('\n')}
`;
}

// ---------------------------------------------------------------------------
// Bundle
// ---------------------------------------------------------------------------

export async function bundleExports(
	results: ExportResult[],
	manifest: ExportManifest,
	captions: string
): Promise<Blob> {
	const zip = new JSZip();

	for (const r of results) {
		zip.file(r.filename, r.blob);
	}

	zip.file('manifest.json', JSON.stringify(manifest, null, 2));
	zip.file('captions.md', captions);

	return zip.generateAsync({ type: 'blob' });
}
