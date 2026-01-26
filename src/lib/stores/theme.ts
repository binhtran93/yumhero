import { browser } from '$app/environment';
import { writable } from 'svelte/store';

type Theme = 'light' | 'dark';

const userTheme = browser && localStorage.getItem('theme');
const systemTheme = browser && window.matchMedia('(prefers-color-scheme: dark)').matches;

const initialTheme: Theme = (userTheme as Theme) || (systemTheme ? 'dark' : 'light');

export const theme = writable<Theme>(initialTheme);

theme.subscribe((value) => {
    if (browser) {
        localStorage.setItem('theme', value);
        if (value === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }
});
