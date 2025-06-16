import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { IMGBB_API_KEY } from '$env/static/private';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { imageUrl } = await request.json();
		
		if (!imageUrl) {
			return json({ error: 'No image URL provided' }, { status: 400 });
		}
		
		// Prepare the form data for ImgBB API
		const formData = new FormData();
		formData.append('key', IMGBB_API_KEY);
		formData.append('image', imageUrl);
		
		// Send request to ImgBB API
		const response = await fetch('https://api.imgbb.com/1/upload', {
			method: 'POST',
			body: formData
		});
		
		if (!response.ok) {
			const errorText = await response.text();
			console.error('ImgBB API error:', errorText);
			return json({ error: 'Failed to upload image to ImgBB' }, { status: response.status });
		}
		
		const data = await response.json();
		
		// Return the ImgBB response
		return json({
			success: true,
			imageUrl: data.data.url,
			displayUrl: data.data.display_url,
			deleteUrl: data.data.delete_url
		});
	} catch (error) {
		console.error('Error uploading image to ImgBB:', error);
		return json({ error: 'Failed to upload image' }, { status: 500 });
	}
}; 