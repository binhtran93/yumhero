import * as cheerio from 'cheerio';
import { getRandomHeaders } from './headers';

/**
 * Fetches HTML content from a URL using fetch with randomized headers (curl-style)
 */
export async function fetchHtml(url: string): Promise<{ html: string; mainImage: string | null }> {
    try {
        const headers = getRandomHeaders();

        console.log('Fetching URL with curl-style driver:', url);

        const response = await fetch(url, {
            headers,
            redirect: 'follow',
            signal: AbortSignal.timeout(30000) // 30 second timeout
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const html = await response.text();

        // Parse HTML with cheerio to extract basic metadata
        const $ = cheerio.load(html);

        // Extract main image from meta tags
        const ogImage = $('meta[property="og:image"]').attr('content') ||
            $('meta[name="og:image"]').attr('content');
        const twitterImage = $('meta[property="twitter:image"]').attr('content') ||
            $('meta[name="twitter:image"]').attr('content');
        const mainImage = ogImage || twitterImage || null;

        return {
            html,
            mainImage
        };

    } catch (error: any) {
        console.error(`Error fetching ${url}:`, error);
        throw new Error(`Failed to fetch URL: ${error.message}`);
    }
}
