import { json } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const eventData = await request.json();

		const dataPath = path.join(process.cwd(), 'src', 'lib', 'data', 'event.json');
		await fs.promises.writeFile(dataPath, JSON.stringify(eventData, null, 2));

		return json({ success: true });
	} catch (error) {
		console.error('Error saving event data:', error);
		return json({ error: 'Failed to save event data' }, { status: 500 });
	}
};
