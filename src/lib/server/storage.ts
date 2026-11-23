import { AwsClient } from 'aws4fetch';
import { env } from '$env/dynamic/private';

// Public-read Neon Object Storage bucket for speaker photos (declared in neon.ts)
const BUCKET = 'lofi-meetup-img';

const EXTENSIONS: Record<string, string> = {
	'image/jpeg': 'jpg',
	'image/png': 'png',
	'image/webp': 'webp',
	'image/gif': 'gif',
	'image/avif': 'avif'
};

function getClient(): AwsClient | null {
	if (!env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY || !env.AWS_ENDPOINT_URL_S3) {
		return null;
	}
	return new AwsClient({
		accessKeyId: env.AWS_ACCESS_KEY_ID,
		secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
		region: env.AWS_REGION || 'us-east-1',
		service: 's3'
	});
}

function bucketBaseUrl(): string {
	return `${(env.AWS_ENDPOINT_URL_S3 || '').replace(/\/$/, '')}/${BUCKET}/`;
}

export function isStoredImageUrl(url: string): boolean {
	return !!env.AWS_ENDPOINT_URL_S3 && url.startsWith(bucketBaseUrl());
}

/** Unwrap our own proxy routes (/api/proxy-image?url=...) to the original source URL. */
export function resolveSourceUrl(src: string): string | null {
	if (!src) return null;
	if (src.startsWith('/api/proxy-image') || src.startsWith('/api/proxy-bsky-image')) {
		const inner = new URL(src, 'http://local').searchParams.get('url');
		return inner && /^https?:\/\//.test(inner) ? inner : null;
	}
	return /^https?:\/\//.test(src) ? src : null;
}

function slugify(value: string): string {
	return value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '')
		.slice(0, 40);
}

/**
 * Copy a remote image into the bucket and return its permanent public URL.
 * Keys are content-addressed, so re-saving the same photo is idempotent and cache-safe.
 */
export async function storeImageFromUrl(sourceUrl: string, prefix: string): Promise<string> {
	const client = getClient();
	if (!client) throw new Error('Neon Object Storage env vars are not configured');

	const res = await fetch(sourceUrl, {
		headers: {
			'User-Agent':
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
		}
	});
	if (!res.ok) throw new Error(`Failed to fetch image (${res.status}): ${sourceUrl}`);

	const contentType = (res.headers.get('Content-Type') || '').split(';')[0].trim();
	if (!contentType.startsWith('image/')) throw new Error(`Not an image (${contentType})`);

	const bytes = await res.arrayBuffer();
	const digest = await crypto.subtle.digest('SHA-256', bytes);
	const hash = [...new Uint8Array(digest)]
		.slice(0, 8)
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
	const key = `${prefix}-${hash}.${EXTENSIONS[contentType] || 'img'}`;
	const objectUrl = bucketBaseUrl() + key;

	const put = await client.fetch(objectUrl, {
		method: 'PUT',
		body: bytes,
		headers: {
			'Content-Type': contentType,
			'Cache-Control': 'public, max-age=31536000, immutable'
		}
	});
	if (!put.ok) throw new Error(`Upload failed (${put.status}): ${await put.text()}`);

	return objectUrl;
}

/** Persist a speaker photo; returns null when there is nothing to store or it is already stored. */
export async function persistSpeakerImage(
	src: string,
	eventNumber: number,
	speakerName: string
): Promise<string | null> {
	const sourceUrl = resolveSourceUrl(src);
	if (!sourceUrl || isStoredImageUrl(sourceUrl)) return null;
	return storeImageFromUrl(sourceUrl, `speakers/lofi-${eventNumber}/${slugify(speakerName)}`);
}
