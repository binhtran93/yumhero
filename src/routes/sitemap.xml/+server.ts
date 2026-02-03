import type { RequestHandler } from '@sveltejs/kit';

const SITE_URL = 'https://yumhero.app';

const staticPages = [
    { url: '/', changefreq: 'daily', priority: 1.0 },
    { url: '/recipes', changefreq: 'daily', priority: 0.9 },
    { url: '/fridge', changefreq: 'daily', priority: 0.8 },
    { url: '/profile', changefreq: 'monthly', priority: 0.5 },
];

export const GET: RequestHandler = async () => {
    const today = new Date().toISOString().split('T')[0];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(page => `    <url>
        <loc>${SITE_URL}${page.url}</loc>
        <lastmod>${today}</lastmod>
        <changefreq>${page.changefreq}</changefreq>
        <priority>${page.priority}</priority>
    </url>`).join('\n')}
</urlset>`;

    return new Response(sitemap, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'max-age=3600'
        }
    });
};
