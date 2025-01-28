import { promises as fs } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';

export async function load() {
	const blogsDirectory = join(process.cwd(), 'src/lib/data/blogs');
	const sponsorsPath = join(process.cwd(), 'src/lib/data/sponsors.json');

	// Load sponsors data
	const sponsorsRaw = await fs.readFile(sponsorsPath, 'utf8');
	const sponsorsData = JSON.parse(sponsorsRaw);

	const files = await fs.readdir(blogsDirectory);

	const posts = await Promise.all(
		files.map(async (filename) => {
			const filePath = join(blogsDirectory, filename);
			const fileContents = await fs.readFile(filePath, 'utf8');
			const { data } = matter(fileContents);

			// Extract date from filename
			const date = filename.substring(0, 10);

			return {
				date,
				title: data.title,
				slug: filename.replace('.md', '')
			};
		})
	);

	// Sort posts by date in descending order
	return {
		posts: posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
		sponsorsData
	};
}
