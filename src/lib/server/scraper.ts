import { createScrapingContext } from './browser';

/**
 * Fetches dynamic content from a URL using an isolated context with proxy and fingerprinting.
 * Used for general/fallback scraping.
 */
export async function fetchDynamicContent(url: string, waitUntil: string = 'domcontentloaded'): Promise<{ text: string; html: string; mainImage: string | null }> {
    const { context, page } = await createScrapingContext({ blockResources: true });

    try {
        await page.goto(url, {
            waitUntil: waitUntil,
            timeout: 30000
        });

        return await page.evaluate(() => {
            const getMetaContent = (propName: string) => {
                const el = document.querySelector(`meta[property="${propName}"], meta[name="${propName}"]`);
                return el ? el.getAttribute('content') : null;
            };

            const mainImage = getMetaContent('og:image') || getMetaContent('twitter:image');

            return {
                text: document.body.innerText,
                html: document.documentElement.outerHTML,
                mainImage
            };
        });

    } catch (error) {
        console.error(`Error fetching dynamic content from ${url}:`, error);
        throw error;
    } finally {
        // if (page) {
        //     try {
        //         page.removeAllListeners('request');
        //         await page.close();
        //     } catch (e) {
        //         console.error('Error closing page:', e);
        //     }
        // }
        // if (context) {
        //     try {
        //         await context.close();
        //     } catch (e) {
        //         console.error('Error closing context:', e);
        //     }
        // }
    }
}
