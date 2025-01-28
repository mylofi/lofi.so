import { promises as fs } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { error } from '@sveltejs/kit';

interface Heading {
	text: string;
	level: number;
	id: string;
}

interface BlogPost {
	title: string;
	author: string;
	author_link: string;
	date: string;
	content: string;
	headings: Heading[];
}

export async function load({ params }): Promise<{ post: BlogPost }> {
	try {
		const { slug } = params;
		const blogsDirectory = join(process.cwd(), 'src/lib/data/blogs');
		const filePath = join(blogsDirectory, `${slug}.md`);

		const fileContents = await fs.readFile(filePath, 'utf8');
		const { data, content } = matter(fileContents);

		// Parse markdown content and ensure it's a string
		const htmlContent = marked.parse(content).toString();

		// Extract headings for table of contents
		const headings: Heading[] = [];
		const tokens = marked.lexer(content);
		tokens.forEach((token) => {
			if (token.type === 'heading') {
				headings.push({
					text: token.text,
					level: token.depth,
					id: token.text.toLowerCase().replace(/[^a-z0-9]+/g, '-')
				});
			}
		});

		return {
			post: {
				title: data.title,
				author: data.author,
				author_link: data.author_link,
				content: htmlContent,
				headings,
				date: slug.substring(0, 10)
			}
		};
	} catch (err) {
		throw error(404, 'Blog post not found');
	}
}
