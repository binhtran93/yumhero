import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker';
// @ts-ignore
import { ConnectFingerprinter } from 'puppeteer-extra-plugin-fingerprinter';
import dotenv from 'dotenv';

dotenv.config();

// Add plugins
puppeteer.use(StealthPlugin());
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

// Fingerprinter is NOT a standard plugin, we use it manually per page.


let browserInstance: any = null;

/**
 * Initializes or returns the existing browser singleton.
 */
async function getBrowser() {
    if (browserInstance) {
        // Check if browser is still connected
        if (browserInstance.isConnected()) {
            return browserInstance;
        }
        // If disconnected, reset and re-launch
        browserInstance = null;
    }

    try {
        browserInstance = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
                // Important for long-running processes to avoid memory accumulation:
                '--js-flags="--max-old-space-size=4096"'
            ]
        });

        // Handle process exit to close browser cleanly
        // We only register this listener once
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
    } catch (error) {
        console.error('Failed to launch browser:', error);
        throw error;
    }
}

/**
 * Scrapes plain text from a URL using an isolated context with proxy and fingerprinting.
 */
export async function scrapeText(url: string): Promise<{ text: string; jsonLds: string[]; mainImage: string | null }> {
    const browser = await getBrowser();
    const proxyUrl = process.env.PROXY_URL;

    // Create isolated context with proxy
    // Note: 'proxyServer' option on createBrowserContext is supported in recent Puppeteer versions
    // We must handle auth separately as Chrome doesn't support auth in proxyServer URL
    let proxyServerArg: string | undefined;
    let proxyAuth: { username: string; password: string } | undefined;

    if (proxyUrl) {
        try {
            const parsed = new URL(proxyUrl);
            proxyServerArg = `${parsed.protocol}//${parsed.host}`;
            if (parsed.username || parsed.password) {
                proxyAuth = {
                    username: parsed.username,
                    password: parsed.password
                };
            }
        } catch (e) {
            console.error('Invalid PROXY_URL, ignoring:', e);
        }
    }

    const context = await browser.createBrowserContext({
        proxyServer: proxyServerArg
    });

    let page: any = null;

    try {
        page = await context.newPage();

        // Polyfill page.route if missing (seems to happen in some environments/versions)
        if (!page.route) {
            // @ts-ignore
            page.route = async (pattern, handler) => {
                await page.setRequestInterception(true);
                page.on('request', async (req: any) => {
                    const route = {
                        request: () => req,
                        continue: (overrides: any) => req.continue(overrides),
                        abort: (errorCode: any) => req.abort(errorCode),
                        fulfill: (response: any) => req.respond(response)
                    };
                    try {
                        await handler(route, req);
                    } catch (e) {
                        console.error('Error in route handler:', e);
                    }
                });
            };
        }

        if (proxyAuth) {
            await page.authenticate(proxyAuth);
        }

        // Apply fingerprinting and resource blocking via the library's hook
        // This replaces manual page.setRequestInterception
        await ConnectFingerprinter('chromium', page, {
            // Empty options triggers auto-generation of fingerprint
            requestInterceptor: async (page: any, requestData: any, route: any) => {
                const resourceType = route.request().resourceType();
                if (['image', 'stylesheet', 'font', 'media', 'other'].includes(resourceType)) {
                    return "abort";
                }
                return "direct"; // Let browser context proxy handle it
            }
        } as any);

        // Strict timeout and navigation
        await page.goto(url, {
            waitUntil: 'domcontentloaded',
            timeout: 30000
        });

        // Extract text, raw JSON-LD scripts, and meta image
        return await page.evaluate(() => {
            const getMetaContent = (propName: string) => {
                const el = document.querySelector(`meta[property="${propName}"], meta[name="${propName}"]`);
                return el ? el.getAttribute('content') : null;
            };

            const mainImage = getMetaContent('og:image') || getMetaContent('twitter:image');

            return {
                text: document.body.innerText,
                // Extract all JSON-LD content as raw strings, let the API handle parsing/validation
                jsonLds: Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
                    .map(el => el.textContent)
                    .filter(content => content !== null) as string[],
                mainImage
            };
        });

    } catch (error) {
        console.error(`Error scraping ${url}:`, error);
        throw error;
    } finally {
        // Cleanup strictly
        if (page) {
            try {
                // Remove listeners to avoid memory leaks
                page.removeAllListeners('request');
                await page.close();
            } catch (e) {
                console.error('Error closing page:', e);
            }
        }
        if (context) {
            try {
                await context.close();
            } catch (e) {
                console.error('Error closing context:', e);
            }
        }
    }
}
