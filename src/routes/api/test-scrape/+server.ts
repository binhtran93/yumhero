import { type RequestHandler } from '@sveltejs/kit';
import { scrapeText } from '$lib/server/scraper';

export const GET: RequestHandler = async ({ url }) => {
    const targetUrl = url.searchParams.get('url');

    if (!targetUrl) {
        return new Response('Missing "url" query parameter', { status: 400 });
    }

    try {
        const result = await scrapeText(targetUrl);
        return new Response(JSON.stringify(result), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
