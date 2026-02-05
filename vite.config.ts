import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
	plugins: [
		sveltekit(),
		tailwindcss(),
		VitePWA({
			registerType: 'autoUpdate',
			includeAssets: ['logo.png'],
			workbox: {
				globPatterns: ['**/*.{js,css,html,svg,png,woff,woff2}'],
				runtimeCaching: [
					{
						urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'google-fonts-cache',
							expiration: {
								maxEntries: 10,
								maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
							},
							cacheableResponse: {
								statuses: [0, 200]
							}
						}
					},
					{
						urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'gstatic-fonts-cache',
							expiration: {
								maxEntries: 10,
								maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
							},
							cacheableResponse: {
								statuses: [0, 200]
							}
						}
					}
				]
			},
			manifest: {
				id: '/',
				name: 'YumHero',
				short_name: 'YumHero',
				description: 'Your personal meal planning hero',
				theme_color: '#ffffff',
				background_color: '#ffffff',
				display: 'standalone',
				orientation: 'portrait',
				start_url: '/',
				scope: '/',
				categories: ['food', 'lifestyle', 'productivity'],
				prefer_related_applications: false,
				icons: [
					{
						src: 'logo.png',
						sizes: '192x192',
						type: 'image/png'
					},
					{
						src: 'logo.png',
						sizes: '512x512',
						type: 'image/png'
					},
					{
						src: 'logo.png',
						sizes: '192x192',
						type: 'image/png',
						purpose: 'maskable'
					},
					{
						src: 'logo.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable'
					}
				],
				shortcuts: [
					{
						name: 'Week Plan',
						short_name: 'Plan',
						url: '/weekplan',
						icons: [{ src: 'logo.png', sizes: '192x192' }]
					},
					{
						name: 'Shopping List',
						short_name: 'Shopping',
						url: '/shopping',
						icons: [{ src: 'logo.png', sizes: '192x192' }]
					},
					{
						name: 'Recipes',
						short_name: 'Recipes',
						url: '/recipes',
						icons: [{ src: 'logo.png', sizes: '192x192' }]
					}
				]
			},
			devOptions: {
				enabled: true,
				type: 'module'
			}
		})
	]
});
