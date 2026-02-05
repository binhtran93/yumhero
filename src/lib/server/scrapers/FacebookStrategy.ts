import type { ScrapingResult, ScrapingStrategy } from './types';
import { fetchHtml } from '../curlScraper';
import * as cheerio from 'cheerio';

export class FacebookStrategy implements ScrapingStrategy {
    supports(url: URL): boolean {
        return url.hostname.includes('facebook.com') || url.hostname.includes('fb.watch');
    }

    async scrape(url: string): Promise<ScrapingResult> {
        // Use curl-style fetch instead of Puppeteer for Facebook
        const { html, mainImage } = await fetchHtml(url);
        const $ = cheerio.load(html);

        // Extract og:title as requested
        const ogTitle = $('meta[property="og:title"]').attr('content') ||
            $('meta[name="twitter:title"]').attr('content') ||
            $('title').text();

        // Also extract description as it often contains the actual recipe text on Facebook posts
        const ogDescription = $('meta[property="og:description"]').attr('content') ||
            $('meta[name="description"]').attr('content');

        const text = `${ogTitle}\n\n${ogDescription || ''}`.trim();

        return {
            text,
            mainImage
        };
    }
}
