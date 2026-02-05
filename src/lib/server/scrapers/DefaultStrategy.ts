import type { ScrapingResult, ScrapingStrategy } from './types';
import { fetchHtml } from '../curlScraper';
import * as cheerio from 'cheerio';

export class DefaultStrategy implements ScrapingStrategy {
    supports(url: URL): boolean {
        // This is the fallback strategy
        return true;
    }

    async scrape(url: string): Promise<ScrapingResult> {
        const { html, mainImage } = await fetchHtml(url);
        const $ = cheerio.load(html);

        // Extract text content (remove script and style tags)
        $('script, style, noscript').remove();
        const text = $('body').text().trim();

        return {
            text,
            mainImage
        };
    }
}
