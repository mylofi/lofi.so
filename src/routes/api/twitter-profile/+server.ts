import { TWITTER_BEARER_TOKEN } from '$env/static/private';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const username = url.searchParams.get('username');

	if (!username) {
		throw error(400, 'Username is required');
	}

	try {
		const userResponse = await fetch(
			`https://api.twitter.com/2/users/by/username/${username.replace('@', '')}?user.fields=profile_image_url`,
			{
				headers: {
					Authorization: `Bearer ${TWITTER_BEARER_TOKEN}`
				}
			}
		);

		if (!userResponse.ok) {
			throw error(userResponse.status, 'Failed to fetch Twitter user');
		}

		const userData = await userResponse.json();

		if (!userData.data) {
			throw error(404, 'Twitter user not found');
		}

		return json({
			profile_image_url: userData.data.profile_image_url.replace('_normal', '')
		});
	} catch (e) {
		console.error('Error fetching Twitter profile:', e);
		throw error(500, 'Failed to fetch Twitter profile image');
	}
};
