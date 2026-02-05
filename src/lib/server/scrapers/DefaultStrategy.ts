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

        // Extract JSON-LD scripts
        const jsonLds: string[] = [];
        $('script[type="application/ld+json"]').each((_, element) => {
            const content = $(element).html();
            if (content) {
                jsonLds.push(content);
            }
        });

        // Extract text content (remove script and style tags)
        $('script, style, noscript').remove();
        const text = $('body').text().trim();

        return {
            text,
            jsonLds,
            mainImage
        };
    }
}
