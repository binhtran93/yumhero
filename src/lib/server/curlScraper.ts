import * as cheerio from 'cheerio';
import { getRandomHeaders } from './headers';

/**
 * Scrapes text content from a URL using fetch with randomized headers (curl-style)
 * This is a lightweight alternative to the Puppeteer-based scraper
 */
export async function scrapeText(url: string): Promise<{ text: string; jsonLds: string[]; mainImage: string | null }> {
    try {
        const headers = getRandomHeaders();

        console.log('Fetching URL with curl-style scraper:', url);
        console.log('Using User-Agent:', headers['User-Agent']);

        const response = await fetch(url, {
            headers,
            redirect: 'follow',
            signal: AbortSignal.timeout(30000) // 30 second timeout
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const html = await response.text();

        // Parse HTML with cheerio
        const $ = cheerio.load(html);

        // Extract text content (remove script and style tags)
        $('script, style, noscript').remove();
        const text = $('body').text().trim();

        // Extract JSON-LD scripts
        const jsonLds: string[] = [];
        $('script[type="application/ld+json"]').each((_, element) => {
            const content = $(element).html();
            if (content) {
                jsonLds.push(content);
            }
        });

        // Extract main image from meta tags
        const ogImage = $('meta[property="og:image"]').attr('content') ||
            $('meta[name="og:image"]').attr('content');
        const twitterImage = $('meta[property="twitter:image"]').attr('content') ||
            $('meta[name="twitter:image"]').attr('content');
        const mainImage = ogImage || twitterImage || null;

        return {
            text,
            jsonLds,
            mainImage
        };

    } catch (error: any) {
        console.error(`Error scraping ${url}:`, error);
        throw new Error(`Failed to scrape URL: ${error.message}`);
    }
}
