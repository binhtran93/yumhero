import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker';
// @ts-ignore
import { ConnectFingerprinter } from 'puppeteer-extra-plugin-fingerprinter';
import dotenv from 'dotenv';

dotenv.config();

// Initialize puppeteer with plugins only once
// @ts-ignore
if (puppeteer.plugins.length === 0) {
    puppeteer.use(StealthPlugin());
    puppeteer.use(AdblockerPlugin({ blockTrackers: true }));
}

let browserInstance: any = null;

/**
 * Initializes or returns the existing browser singleton.
 * Shared across all scraping strategies.
 */
export async function getBrowser() {
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
                '--disable-web-security',
                '--disable-features=IsolateOrigins,site-per-process',
                // Important for long-running processes to avoid memory accumulation:
                '--js-flags="--max-old-space-size=4096"'
            ]
        });

        // Handle process exit to close browser cleanly
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
 * Creates a browser context and a page with fingerprinting and optional proxy.
 */
export async function createScrapingContext(options: { blockResources?: boolean } = {}) {
    const browser = await getBrowser();

    const proxyUrl = process.env.PROXY_URL;
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

    const page = await context.newPage();

    // Polyfill page.route if missing
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

    // Apply fingerprinting and resource blocking
    await ConnectFingerprinter('chromium', page, {
        requestInterceptor: async (page: any, requestData: any, route: any) => {
            if (options.blockResources) {
                const resourceType = route.request().resourceType();
                if (['image', 'stylesheet', 'font', 'media', 'other'].includes(resourceType)) {
                    return "abort";
                }
            }
            return "direct";
        }
    } as any);

    return { context, page };
}
