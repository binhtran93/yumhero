import type { ScrapingResult, ScrapingStrategy } from './types';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

// Use Stealth plugin to avoid detection
// @ts-ignore
puppeteer.use(StealthPlugin());

let browserInstance: any = null;

/**
 * Singleton browser instance for TikTok strategy
 */
async function getBrowser() {
    if (browserInstance && browserInstance.isConnected()) {
        return browserInstance;
    }

    browserInstance = await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process'
        ]
    });

    // Cleanup on exit
    if (process.listenerCount('SIGINT') === 0) {
        process.on('SIGINT', async () => {
            if (browserInstance) {
                await browserInstance.close();
                browserInstance = null;
            }
            process.exit();
        });
    }

    return browserInstance;
}

export class TikTokStrategy implements ScrapingStrategy {
    supports(url: URL): boolean {
        return url.hostname.includes('tiktok.com');
    }

    async scrape(url: string): Promise<ScrapingResult> {
        const browser = await getBrowser();
        const page = await browser.newPage();

        try {
            // Set a realistic viewport and user agent
            await page.setViewport({ width: 1280, height: 800 });
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

            // 1. Navigate quickly
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

            // 2. Wait specifically for the content you need
            // Using a partial match for the class name as TikTok uses hashed classes
            await page.waitForSelector('[class*="DivMediaCardDescriptionContainer"]', {
                visible: true,
                timeout: 15000
            });

            // Extract content from the browser context
            const result = await page.evaluate(() => {
                const getMetaContent = (nameOrProperty: string) => {
                    const el = document.querySelector(`meta[name="${nameOrProperty}"], meta[property="${nameOrProperty}"]`);
                    return el ? el.getAttribute('content') : null;
                };

                // The primary target: the description container
                const container = document.querySelector('[class*="DivMediaCardDescriptionContainer"]');
                const containerText = container ? (container as HTMLElement).innerText : '';

                // Fallbacks from meta tags
                const rHDescription = document.querySelector('meta[name="og:description"][data-rh="true"]')?.getAttribute('content');
                const ogDescription = getMetaContent('og:description');
                const metaDescription = getMetaContent('description');

                // Main image
                const mainImage = getMetaContent('og:image') || getMetaContent('twitter:image');

                // Extract all JSON-LD content
                const jsonLds = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
                    .map(el => el.textContent)
                    .filter(content => content !== null) as string[];

                return {
                    containerText,
                    rHDescription,
                    ogDescription,
                    metaDescription,
                    jsonLds,
                    mainImage
                };
            });

            // Reconstruct the text content prioritized by the container the user asked for
            // Also include JSON-LD description as a fallback
            let jsonLdDescription = '';
            for (const rawJson of result.jsonLds) {
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

            const text = result.containerText ||
                result.rHDescription ||
                jsonLdDescription ||
                result.ogDescription ||
                result.metaDescription ||
                '';

            return {
                text,
                jsonLds: result.jsonLds,
                mainImage: result.mainImage
            };

        } catch (error) {
            console.error(`TikTok scraping failed for ${url}:`, error);
            throw error;
        } finally {
            // Always close the page to avoid memory leaks
            if (page) {
                await page.close();
            }
        }
    }
}
