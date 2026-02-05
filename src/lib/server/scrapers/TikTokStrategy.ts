import type { ScrapingResult, ScrapingStrategy } from './types';
import { fetchDynamicContent } from '../scraper';
import * as cheerio from 'cheerio';

export class TikTokStrategy implements ScrapingStrategy {
    supports(url: URL): boolean {
        return url.hostname.includes('tiktok.com');
    }

    async scrape(url: string): Promise<ScrapingResult> {
        // Use Puppeteer ONLY for TikTok to handle its JS-heavy nature and anti-bot
        const { html, mainImage, jsonLds } = await fetchDynamicContent(url, 'networkidle2');
        const $ = cheerio.load(html);

        // For TikTok, the meta description is highly reliable for recipe content
        // We look for both standard meta description and the one with data-rh="true"
        const metaDescription = $('meta[name="og:description"]').attr('content') ||
            $('meta[property="og:description"]').attr('content') ||
            $('meta[name="twitter:description"]').attr('content');

        const rHDescription = $('meta[name="og:description"][data-rh="true"]').attr('content');

        // Some TikTok JSON-LD (VideoObject) contains the description
        let jsonLdDescription = '';
        if (jsonLds) {
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
        }

        const textContent = rHDescription || jsonLdDescription || metaDescription || '';

        return {
            text: textContent,
            jsonLds: jsonLds || [],
            mainImage
        };
    }
}
