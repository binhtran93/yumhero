import { writable } from 'svelte/store';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

const createToastStore = () => {
    const { subscribe, update } = writable<Toast[]>([]);

    const addToast = (message: string, type: ToastType = 'info', duration = 3000) => {
        const id = Math.random().toString(36).substring(2, 9);
        const newToast: Toast = { id, message, type, duration };

        update(toasts => [...toasts, newToast]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    };

    const removeToast = (id: string) => {
        update(toasts => toasts.filter(t => t.id !== id));
    };

    return {
        subscribe,
        success: (msg: string, dur?: number) => addToast(msg, 'success', dur),
        error: (msg: string, dur?: number) => addToast(msg, 'error', dur),
        info: (msg: string, dur?: number) => addToast(msg, 'info', dur),
        warning: (msg: string, dur?: number) => addToast(msg, 'warning', dur),
        remove: removeToast
    };
};

export const toasts = createToastStore();
