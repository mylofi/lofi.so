#!/usr/bin/env node
/**
 * This script generates a search index by crawling the site content.
 * It extracts content from pages, blog posts, and other content types,
 * and saves the index to a JSON file that can be used by the search functionality.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { globSync } from 'glob';
import matter from 'gray-matter';
import { JSDOM } from 'jsdom';
import { marked } from 'marked';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const CONTENT_DIRS = [
  { path: 'src/routes', pattern: '**/*.{svelte,md}', type: 'route' },
  { path: 'src/routes/blog', pattern: '**/*.{svelte,md}', type: 'blog' },
  { path: 'src/routes/directory', pattern: '**/*.{svelte,md}', type: 'directory' },
  { path: 'src/routes/docs', pattern: '**/*.{svelte,md}', type: 'docs' },
  // Add lib/data/blogs for markdown blog posts stored in lib
  { path: 'src/lib/data/blogs', pattern: '**/*.md', type: 'blog' },
];

// Data files to process
const DATA_FILES = [
  { path: 'src/lib/data/directory/Item.json', type: 'directory_item' },
  { path: 'src/lib/data/content.json', type: 'content' },
  { path: 'src/lib/data/event.json', type: 'event' },
  { path: 'src/lib/data/sponsors.json', type: 'sponsor' },
  { path: 'src/lib/data/mentions.json', type: 'mention' },
];

const OUTPUT_FILE = 'static/search-index.json';

// Helper function to extract text content from HTML
function extractTextFromHtml(html) {
  const dom = new JSDOM(html);
  return dom.window.document.body.textContent || '';
}

// Helper function to determine the URL from the file path
function getUrlFromPath(filePath, contentType) {
  // Remove src/routes prefix and file extension
  let url = filePath
    .replace(/^src\/routes/, '')
    .replace(/\.(svelte|md)$/, '');
  
  // Handle index files
  url = url.replace(/\/\+page$/, '');
  url = url.replace(/\/index$/, '');
  
  // Ensure URL starts with /
  if (!url.startsWith('/')) {
    url = '/' + url;
  }
  
  return url;
}

// Helper function to determine the URL for a blog post in lib/data/blogs
function getBlogUrlFromFilename(filename) {
  // Extract date and slug from filename (e.g., 2023-05-29-i-wrote-a-static-web-page.md)
  const match = filename.match(/^(\d{4}-\d{2}-\d{2})-(.+)\.md$/);
  if (match) {
    const [, date, slug] = match;
    return `/blog/${slug}`;
  }
  return `/blog/${path.basename(filename, '.md')}`;
}

// Helper function to determine the category based on content type and path
function getCategoryFromPath(filePath, contentType) {
  if (contentType === 'blog') return 'Blog Post';
  if (contentType === 'docs') return 'Documentation';
  if (contentType === 'directory') {
    // Check if it's a tool, library, or database
    const content = fs.readFileSync(filePath, 'utf-8');
    if (content.includes('category: "library"') || content.includes('category: library')) return 'Library';
    if (content.includes('category: "tool"') || content.includes('category: tool')) return 'Tool';
    if (content.includes('category: "database"') || content.includes('category: database')) return 'Database';
    return 'Directory Entry';
  }
  
  // Check if it's a special page
  if (filePath.includes('community')) return 'Community';
  if (filePath.includes('event')) return 'Event';
  
  return 'Page';
}

// Helper function to extract content from a Svelte file
function extractFromSvelte(filePath, contentType) {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Extract title from <title> tag or h1
  let title = '';
  const titleMatch = content.match(/<title>(.*?)<\/title>/);
  if (titleMatch) {
    title = titleMatch[1];
  } else {
    const h1Match = content.match(/<h1>(.*?)<\/h1>/);
    if (h1Match) {
      title = h1Match[1];
    } else {
      // Use filename as fallback
      title = path.basename(filePath, path.extname(filePath))
        .replace(/^\+page$/, 'Home')
        .replace(/^index$/, 'Home')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize words
    }
  }
  
  // Extract meta description
  let excerpt = '';
  const metaDescMatch = content.match(/<meta name="description" content="(.*?)"/);
  if (metaDescMatch) {
    excerpt = metaDescMatch[1];
  } else {
    // Extract first paragraph as fallback
    const paragraphMatch = content.match(/<p>(.*?)<\/p>/);
    if (paragraphMatch) {
      excerpt = extractTextFromHtml(paragraphMatch[1]);
    }
  }
  
  // If we still don't have an excerpt, use the first 150 characters of text content
  if (!excerpt) {
    const textContent = extractTextFromHtml(content);
    excerpt = textContent.substring(0, 150).trim() + '...';
  }
  
  const url = getUrlFromPath(filePath, contentType);
  const category = getCategoryFromPath(filePath, contentType);
  
  return {
    title,
    url,
    excerpt,
    category,
    filePath // For debugging
  };
}

// Helper function to extract content from a Markdown file
function extractFromMarkdown(filePath, contentType) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const { data, content: markdownContent } = matter(content);
  
  // Extract title from frontmatter or first heading
  let title = data.title;
  if (!title) {
    const headingMatch = markdownContent.match(/^# (.*?)$/m);
    if (headingMatch) {
      title = headingMatch[1];
    } else {
      // Use filename as fallback
      title = path.basename(filePath, path.extname(filePath))
        .replace(/^index$/, 'Home')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize words
    }
  }
  
  // Extract excerpt from frontmatter or first paragraph
  let excerpt = data.description || data.excerpt || data.summary;
  if (!excerpt) {
    const html = marked(markdownContent);
    const paragraphMatch = html.match(/<p>(.*?)<\/p>/);
    if (paragraphMatch) {
      excerpt = extractTextFromHtml(paragraphMatch[1]);
    }
  }
  
  // If we still don't have an excerpt, use the first 150 characters of text content
  if (!excerpt) {
    const textContent = extractTextFromHtml(marked(markdownContent));
    excerpt = textContent.substring(0, 150).trim() + '...';
  }
  
  // Determine URL based on file location
  let url;
  let category = data.category || getCategoryFromPath(filePath, contentType);
  
  // Special handling for blog posts in lib/data/blogs
  if (filePath.includes('src/lib/data/blogs')) {
    url = getBlogUrlFromFilename(path.basename(filePath));
    category = 'Blog Post';
  } else {
    url = getUrlFromPath(filePath, contentType);
  }
  
  return {
    title,
    url,
    excerpt,
    category,
    filePath // For debugging
  };
}

// Helper function to process directory items from JSON
function processDirectoryItems(filePath) {
  const entries = [];
  const content = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(content);
  
  // Load Main_Category data to determine the correct path
  const mainCategoryPath = path.join(path.dirname(filePath), 'Main_Category.json');
  let mainCategories = {};
  
  try {
    const mainCategoryContent = fs.readFileSync(mainCategoryPath, 'utf-8');
    const mainCategoryData = JSON.parse(mainCategoryContent);
    
    // Create a mapping of id to slug
    if (mainCategoryData.records && Array.isArray(mainCategoryData.records)) {
      mainCategoryData.records.forEach(category => {
        if (category.id && category.fields && category.fields.Slug) {
          mainCategories[category.id] = category.fields.Slug;
        }
      });
    }
  } catch (error) {
    console.error(`Error loading Main_Category data: ${error}`);
    // Default mappings if file can't be loaded
    mainCategories = {
      1: 'apps',
      3: 'projects'
    };
  }
  
  if (data.records && Array.isArray(data.records)) {
    for (const record of data.records) {
      if (record.fields) {
        const { Title, slug, description, author, Main_Category } = record.fields;
        
        if (Title && slug) {
          let category = 'Directory Entry';
          
          // Determine more specific category if possible
          if (record.fields.Categories) {
            const categories = Array.isArray(record.fields.Categories) ? record.fields.Categories : [record.fields.Categories];
            if (categories.includes('L')) category = 'Library';
            else if (categories.includes('T')) category = 'Tool';
            else if (categories.includes('D')) category = 'Database';
          }
          
          // Determine the correct URL path based on Main_Category
          let urlPath = 'directory';
          if (Main_Category && mainCategories[Main_Category]) {
            urlPath = `directory/${mainCategories[Main_Category]}`;
          }
          
          entries.push({
            title: Title,
            url: `/${urlPath}/${slug}`,
            excerpt: description || `${Title} by ${author || 'Unknown'}`,
            category
          });
        }
      }
    }
  }
  
  return entries;
}

// Helper function to process content items from JSON
function processContentItems(filePath) {
  const entries = [];
  const content = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(content);
  
  if (Array.isArray(data)) {
    // Process each main section
    data.forEach((section, sectionIndex) => {
      if (section.title) {
        // Add the main section
        const sectionId = section.title.toLowerCase().replace(/\s+/g, '-');
        entries.push({
          title: section.title,
          url: `/#${sectionId}`,
          excerpt: `${section.title} - Main section of the home page`,
          category: 'Section'
        });
      }
      
      // Process subsections
      if (section.sections && Array.isArray(section.sections)) {
        section.sections.forEach(subsection => {
          if (subsection.title) {
            // Determine the appropriate URL based on the section and subsection
            let url = '/';
            let category = 'Resource';
            
            // Handle specific sections differently
            if (sectionIndex === 0) {
              // Learn section
              if (subsection.title === 'Things to read' || 
                  subsection.title === 'Things to watch' || 
                  subsection.title === 'Recent Videos & Talks') {
                url = `/#learn`;
                category = 'Learning Resource';
              }
            } else if (sectionIndex === 1) {
              // Apps section (libraries, tools, etc.)
              url = `/#apps`;
              category = 'Development Resource';
            } else if (sectionIndex === 2) {
              // Apps to try section
              if (subsection.title === 'Apps to try') {
                url = `/#apps-to-try`;
                category = 'Application';
              }
            }
            
            // Add the subsection
            const subsectionId = subsection.title.toLowerCase().replace(/\s+/g, '-');
            entries.push({
              title: subsection.title,
              url: `${url}${url === '/' ? '' : '-'}${subsectionId}`,
              excerpt: `${section.title} - ${subsection.title}`,
              category
            });
          }
          
          // Add individual items
          if (subsection.items && Array.isArray(subsection.items)) {
            subsection.items.forEach(item => {
              if (item.title && item.url) {
                // Determine the category based on the section and subsection
                let category = 'External Resource';
                
                if (sectionIndex === 0) {
                  // Learn section
                  if (subsection.title === 'Things to read') {
                    category = 'Article';
                  } else if (subsection.title === 'Things to watch' || 
                             subsection.title === 'Recent Videos & Talks') {
                    category = 'Video';
                  }
                } else if (sectionIndex === 1) {
                  // Apps section (libraries, tools, etc.)
                  if (subsection.title.includes('Storage')) {
                    category = 'Storage Library';
                  } else if (subsection.title.includes('Collaboration')) {
                    category = 'Collaboration Tool';
                  } else if (subsection.title.includes('Development')) {
                    category = 'Development Tool';
                  }
                } else if (sectionIndex === 2) {
                  // Apps to try section
                  category = 'Application';
                }
                
                entries.push({
                  title: item.title,
                  url: item.url, // Use the actual URL from the data
                  excerpt: `${item.title} by ${item.author || 'Unknown'}`,
                  category
                });
              }
            });
          }
        });
      }
    });
  }
  
  return entries;
}

// Helper function to process events from JSON
function processEvents(filePath) {
  const entries = [];
  const content = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(content);
  
  if (Array.isArray(data)) {
    for (const event of data) {
      if (event.title) {
        // Events are likely displayed on the home page or a dedicated events page
        // Check if there's a dedicated slug or URL in the event data
        let url = '/';
        if (event.slug) {
          url = `/events/${event.slug}`;
        } else if (event.url) {
          url = event.url;
        } else {
          // Default to home page with event anchor
          url = `/#events`;
        }
        
        entries.push({
          title: event.title,
          url: url,
          excerpt: event.description || `${event.title} - ${event.date || 'Upcoming event'}`,
          category: 'Event'
        });
      }
    }
  }
  
  return entries;
}

// Helper function to process sponsors from JSON
function processSponsors(filePath) {
  const entries = [];
  const content = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(content);
  
  // Check if the data has a sponsors array
  if (data.sponsors && Array.isArray(data.sponsors)) {
    for (const sponsor of data.sponsors) {
      if (sponsor.name && sponsor.url) {
        // Sponsors are external links, so use the URL directly
        entries.push({
          title: sponsor.name,
          url: sponsor.url, // Use the actual URL from the data
          excerpt: sponsor.description || `${sponsor.name} - ${sponsor.tier || 'Sponsor'} of Local-First Web`,
          category: 'Sponsor'
        });
      }
    }
  } else if (Array.isArray(data)) {
    // Handle the case where the data is a direct array of sponsors
    for (const sponsor of data) {
      if (sponsor.name && sponsor.url) {
        // Sponsors are external links, so use the URL directly
        entries.push({
          title: sponsor.name,
          url: sponsor.url, // Use the actual URL from the data
          excerpt: sponsor.description || `${sponsor.name} - Sponsor of Local-First Web`,
          category: 'Sponsor'
        });
      }
    }
  }
  
  return entries;
}

// Helper function to process mentions from JSON
function processMentions(filePath) {
  const entries = [];
  const content = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(content);
  
  if (Array.isArray(data)) {
    for (const mention of data) {
      if (mention.title && mention.url) {
        // Mentions are external links, so use the URL directly
        entries.push({
          title: mention.title,
          url: mention.url, // Use the actual URL from the data
          excerpt: mention.description || `${mention.title} by ${mention.author || 'Unknown'}`,
          category: 'Mention'
        });
      }
    }
  }
  
  return entries;
}

// Main function to generate the search index
async function generateSearchIndex() {
  const searchIndex = [];
  
  // Process each content directory
  for (const dir of CONTENT_DIRS) {
    const pattern = path.join(dir.path, dir.pattern);
    const files = globSync(pattern);
    
    for (const file of files) {
      try {
        // Skip layout files and server files
        if (file.includes('+layout') || file.includes('+server')) {
          continue;
        }
        
        let entry;
        if (file.endsWith('.md')) {
          entry = extractFromMarkdown(file, dir.type);
        } else if (file.endsWith('.svelte')) {
          entry = extractFromSvelte(file, dir.type);
        }
        
        if (entry && entry.title && entry.excerpt) {
          // Remove filePath before adding to index
          delete entry.filePath;
          searchIndex.push(entry);
        }
      } catch (error) {
        console.error(`Error processing ${file}:`, error);
      }
    }
  }
  
  // Process data files
  for (const dataFile of DATA_FILES) {
    try {
      let entries = [];
      
      switch (dataFile.type) {
        case 'directory_item':
          entries = processDirectoryItems(dataFile.path);
          break;
        case 'content':
          entries = processContentItems(dataFile.path);
          break;
        case 'event':
          entries = processEvents(dataFile.path);
          break;
        case 'sponsor':
          entries = processSponsors(dataFile.path);
          break;
        case 'mention':
          entries = processMentions(dataFile.path);
          break;
      }
      
      // Add entries to search index
      searchIndex.push(...entries);
      console.log(`Processed ${dataFile.path}: added ${entries.length} entries`);
      
    } catch (error) {
      console.error(`Error processing data file ${dataFile.path}:`, error);
    }
  }
  
  // Add some hardcoded entries for important pages that might not be caught
  const hardcodedEntries = [
    {
      title: 'Home',
      url: '/',
      excerpt: 'Local-first software for the web - Build apps that work offline and sync when online',
      category: 'Page'
    },
    {
      title: 'Directory',
      url: '/directory',
      excerpt: 'Explore local-first applications and tools for developers and users',
      category: 'Page'
    },
    {
      title: 'Blog',
      url: '/blog',
      excerpt: 'Latest news and articles about local-first development and the ecosystem',
      category: 'Page'
    }
  ];
  
  // Add hardcoded entries only if they don't already exist
  for (const entry of hardcodedEntries) {
    if (!searchIndex.some(item => item.url === entry.url)) {
      searchIndex.push(entry);
    }
  }
  
  // Remove duplicates based on URL
  const uniqueEntries = [];
  const seenUrls = new Set();
  
  for (const entry of searchIndex) {
    if (!seenUrls.has(entry.url)) {
      seenUrls.add(entry.url);
      uniqueEntries.push(entry);
    }
  }
  
  // Write the search index to a JSON file
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(uniqueEntries, null, 2));
  console.log(`Search index generated with ${uniqueEntries.length} entries and saved to ${OUTPUT_FILE}`);
  
  return uniqueEntries;
}

// Run the generator
generateSearchIndex().catch(error => {
  console.error('Error generating search index:', error);
  process.exit(1);
});
 