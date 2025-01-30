import { promises as fs } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';

export async function load() {
	const posts = await Promise.all(
		Object.entries(import.meta.glob('/src/lib/data/blogs/*.md', { as: 'raw', eager: true })).map(
			async ([path, content]: [string, string]) => {
				const filename = path.split('/').pop() || '';
				const { data } = matter(content);

				const date = filename.substring(0, 10);

				return {
					date,
					title: data.title,
					slug: filename.replace('.md', '')
				};
			}
		)
	);

	const sponsorsData = (await import('../../lib/data/sponsors.json')).default;

	return {
		posts: posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
		sponsorsData
	};
}
