import { createPersistedStore } from './settings';

export const sidebarExpanded = createPersistedStore<boolean>('sidebarExpanded', true);
