import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const username = url.searchParams.get('username');
	const platform = url.searchParams.get('platform') || 'twitter';

	if (!username) {
		throw error(400, 'Username is required');
	}

	try {
		let profileImageUrl;

		if (platform === 'bluesky') {
			const response = await fetch(
				`https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${encodeURIComponent(username)}`
			);

			if (!response.ok) {
				throw error(response.status, 'Failed to fetch Bluesky user');
			}

			const data = await response.json();
			profileImageUrl = data.avatar;
		} else {
			const response = await fetch(`https://unavatar.io/twitter/${username.replace('@', '')}?json=true`);

			if (!response.ok) {
				throw error(response.status, 'Failed to fetch Twitter user');
			}

			const data = await response.json();
			profileImageUrl = data.url;
		}

		if (!profileImageUrl) {
			throw error(404, `${platform} user not found`);
		}

		return json({
			profile_image_url: profileImageUrl
		});
	} catch (e) {
		console.error(`Error fetching ${platform} profile:`, e);
		throw error(500, `Failed to fetch ${platform} profile image`);
	}
};
