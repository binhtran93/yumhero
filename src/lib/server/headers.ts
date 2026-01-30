import UserAgent from 'user-agents';

/**
 * Generates randomized headers for HTTP requests
 */
export function getRandomHeaders(): Record<string, string> {
    const userAgent = new UserAgent({ deviceCategory: 'desktop' });

    // Common accept headers
    const acceptHeaders = [
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    ];

    const acceptLanguages = [
        'en-US,en;q=0.9',
        'en-GB,en;q=0.9',
        'en-US,en;q=0.9,vi;q=0.8',
        'en-US,en;q=0.5'
    ];

    const acceptEncodings = [
        'gzip, deflate, br',
        'gzip, deflate',
        'br, gzip, deflate'
    ];

    return {
        'User-Agent': userAgent.toString(),
        'Accept': acceptHeaders[Math.floor(Math.random() * acceptHeaders.length)],
        'Accept-Language': acceptLanguages[Math.floor(Math.random() * acceptLanguages.length)],
        'Accept-Encoding': acceptEncodings[Math.floor(Math.random() * acceptEncodings.length)],
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0'
    };
}
