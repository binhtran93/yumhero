import type { ScrapingResult, ScrapingStrategy } from './types';
import { fetchDynamicContent } from '../scraper';

export class InstagramStrategy implements ScrapingStrategy {
    supports(url: URL): boolean {
        return url.hostname.includes('instagram.com');
    }

    async scrape(url: string): Promise<ScrapingResult> {
        const { text, html, jsonLds, mainImage } = await fetchDynamicContent(url);

        // For Instagram, we primarily want the meta description as it contains the caption
        // The fetchDynamicContent already returns the body text, but we can refine it here if needed.
        // However, based on previous requirements, we want to extract the description meta tag.

        // Since the driver now returns the full HTML, we can re-parse it here or 
        // rely on the driver having already done some work. 
        // Let's parse the meta description from the HTML returned by the driver.

        const metaDescription = this.extractMetaDescription(html);

        return {
            text: metaDescription || text,
            jsonLds,
            mainImage
        };
    }

    private extractMetaDescription(html: string): string | null {
        // Simple regex to extract meta description from HTML string
        const match = html.match(/<meta[^>]+(?:name|property)=["'](?:og:)?description["'][^>]+content=["']([^"']+)["']/i) ||
            html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["'](?:og:)?description["']/i);

        if (match && match[1]) {
            // Decode HTML entities (basic)
            return match[1]
                .replace(/&quot;/g, '"')
                .replace(/&amp;/g, '&')
                .replace(/&#039;/g, "'")
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>');
        }
        return null;
    }
}
