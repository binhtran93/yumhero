import { writable } from 'svelte/store';
import {
    GoogleAuthProvider,
    signInWithPopup,
    sendSignInLinkToEmail,
    isSignInWithEmailLink,
    signInWithEmailLink,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    type User
} from 'firebase/auth';
import { auth } from '../firebase';

export const user = writable<User | null>(null);
export const loading = writable(true); // Initial loading state

import { syncSubscription } from './subscription';
import { seedDefaultRecipesIfNeeded } from './defaultRecipes';

onAuthStateChanged(auth, (u) => {
    user.set(u);
    syncSubscription(u);
    if (u) {
        seedDefaultRecipesIfNeeded(u.uid).catch((error) => {
            console.error('Default recipe seeding failed:', error);
        });
    }
    loading.set(false);
});

export const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error('Google Sign-In Error:', error);
        throw error;
    }
};

export const sendMagicLink = async (email: string) => {
    const actionCodeSettings = {
        url: `${window.location.origin}/login`, // Redirect back to login page to handle the link
        handleCodeInApp: true
    };
    try {
        await sendSignInLinkToEmail(auth, email, actionCodeSettings);
        window.localStorage.setItem('emailForSignIn', email);
    } catch (error) {
        console.error('Magic Link Error:', error);
        throw error;
    }
};

export const signInWithLiveLink = async (url: string) => {
    if (isSignInWithEmailLink(auth, url)) {
        let email = window.localStorage.getItem('emailForSignIn');
        if (!email) {
            email = window.prompt('Please provide your email for confirmation');
        }
        if (email) {
            try {
                await signInWithEmailLink(auth, email, url);
                window.localStorage.removeItem('emailForSignIn');
            } catch (error) {
                console.error('Live Link Sign-In Error:', error);
                throw error;
            }
        }
    }
};

export const signOut = async () => {
    try {
        await firebaseSignOut(auth);
    } catch (error) {
        console.error('Sign Out Error:', error);
        throw error;
    }
};
