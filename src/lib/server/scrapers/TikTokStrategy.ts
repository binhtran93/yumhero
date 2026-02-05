import type { ScrapingResult, ScrapingStrategy } from './types';
import { fetchHtml } from '../curlScraper';
import * as cheerio from 'cheerio';

export class TikTokStrategy implements ScrapingStrategy {
    supports(url: URL): boolean {
        return url.hostname.includes('tiktok.com');
    }

    async scrape(url: string): Promise<ScrapingResult> {
        const { html, mainImage } = await fetchHtml(url);
        const $ = cheerio.load(html);

        // For TikTok, the meta description is highly reliable for recipe content
        // We look for both standard meta description and the one with data-rh="true"
        const metaDescription = $('meta[name="description"]').attr('content') ||
            $('meta[property="og:description"]').attr('content') ||
            $('meta[name="twitter:description"]').attr('content');

        const rHDescription = $('meta[name="description"][data-rh="true"]').attr('content');

        // Extract JSON-LD scripts as they might contain additional metadata
        const jsonLds: string[] = [];
        $('script[type="application/ld+json"]').each((_, element) => {
            const content = $(element).html();
            if (content) {
                jsonLds.push(content);
            }
        });

        // Some TikTok JSON-LD (VideoObject) contains the description
        let jsonLdDescription = '';
        for (const rawJson of jsonLds) {
            try {
                const data = JSON.parse(rawJson);
                if (data.description) {
                    jsonLdDescription = data.description;
                    break;
                }
            } catch (e) {
                // Ignore parse errors
            }
        }

        const textContent = rHDescription || jsonLdDescription || metaDescription || '';

        return {
            text: textContent,
            jsonLds,
            mainImage
        };
    }
}
