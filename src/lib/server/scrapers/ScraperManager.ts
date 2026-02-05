import type { ScrapingResult, ScrapingStrategy } from './types';
import { DefaultStrategy } from './DefaultStrategy';
import { InstagramStrategy } from './InstagramStrategy';
import { TikTokStrategy } from './TikTokStrategy';
import { FacebookStrategy } from './FacebookStrategy';

export class ScraperManager {
    private strategies: ScrapingStrategy[] = [];
    private defaultStrategy: ScrapingStrategy;

    constructor() {
        // Register specialized strategies
        this.strategies.push(new InstagramStrategy());
        this.strategies.push(new TikTokStrategy());
        this.strategies.push(new FacebookStrategy());

        // Fallback strategy
        this.defaultStrategy = new DefaultStrategy();
    }

    async scrape(url: string): Promise<ScrapingResult> {
        const parsedUrl = new URL(url);

        // Find the first strategy that supports this URL
        const strategy = this.strategies.find(s => s.supports(parsedUrl)) || this.defaultStrategy;

        console.log(`Using strategy: ${strategy.constructor.name} for ${url}`);

        return await strategy.scrape(url);
    }
}

// Export a singleton instance
export const scraperManager = new ScraperManager();
