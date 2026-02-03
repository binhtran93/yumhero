import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export const load = () => {
    throw error(404, 'Not Found');
};
