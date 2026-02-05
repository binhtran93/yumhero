import type { ScrapingResult, ScrapingStrategy } from './types';
import { fetchHtml } from '../curlScraper';
import * as cheerio from 'cheerio';

export class InstagramStrategy implements ScrapingStrategy {
    supports(url: URL): boolean {
        return url.hostname.includes('instagram.com');
    }

    async scrape(url: string): Promise<ScrapingResult> {
        const { html, mainImage } = await fetchHtml(url);
        const $ = cheerio.load(html);

        // For Instagram, we primarily want the meta description as it contains the caption
        const metaDescription = $('meta[name="description"]').attr('content') ||
            $('meta[property="og:description"]').attr('content') ||
            $('meta[name="twitter:description"]').attr('content');

        return {
            text: metaDescription || '',
            mainImage
        };
    }
}
