import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
	const imageUrl = url.searchParams.get('url');
	if (!imageUrl) {
		return new Response('Missing url parameter', { status: 400 });
	}

	try {
		const response = await fetch(imageUrl, {
			headers: {
				'User-Agent':
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
			}
		});
		if (!response.ok) {
			return new Response('Failed to fetch image', { status: response.status });
		}
		const blob = await response.blob();
		return new Response(blob, {
			headers: {
				'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
				'Cache-Control': 'public, max-age=86400'
			}
		});
	} catch (error) {
		return new Response('Failed to fetch image', { status: 500 });
	}
};
