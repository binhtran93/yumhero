import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// const headers = Object.fromEntries(event.request.headers.entries());
	// console.info(
	// 	JSON.stringify({
	// 		method: event.request.method,
	// 		url: `${event.url.pathname}${event.url.search}`,
	// 		headers
	// 	})
	// );
	return resolve(event);
};
