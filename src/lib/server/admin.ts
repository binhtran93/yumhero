import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import {
    FIREBASE_ADMIN_PROJECT_ID,
    FIREBASE_ADMIN_CLIENT_EMAIL,
    FIREBASE_ADMIN_PRIVATE_KEY
} from '$env/static/private';

// Initialize Firebase Admin
if (!getApps().length) {
    if (FIREBASE_ADMIN_PRIVATE_KEY) {
        initializeApp({
            credential: cert({
                projectId: FIREBASE_ADMIN_PROJECT_ID,
                clientEmail: FIREBASE_ADMIN_CLIENT_EMAIL,
                // Handle newlines in private key if passed as a string
                privateKey: FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
            })
        });
    }
}

export const adminAuth = getAuth();
export const adminDb = getFirestore();
