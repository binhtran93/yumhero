import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	console.info(`${event.request.method} ${event.url.pathname}${event.url.search}`);
	return resolve(event);
};
