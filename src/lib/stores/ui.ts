import { createPersistedStore } from './settings';
import { writable } from 'svelte/store';
import type { Snippet } from 'svelte';

export const sidebarExpanded = createPersistedStore<boolean>('sidebarExpanded', true);
export const headerActions = writable<Snippet | null>(null);
