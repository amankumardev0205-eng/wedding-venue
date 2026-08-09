import path from 'path';
import { fileURLToPath } from 'url';
import admin from 'firebase-admin';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Safeguard: Ensure we never connect to emulators in production
if (process.env.NODE_ENV === 'production') {
  if (process.env.FIRESTORE_EMULATOR_HOST) {
    console.warn('Warning: FIRESTORE_EMULATOR_HOST was set in production env. Removing it to prevent connecting to local emulator.');
    delete process.env.FIRESTORE_EMULATOR_HOST;
  }
  if (process.env.FIREBASE_STORAGE_EMULATOR_HOST) {
    console.warn('Warning: FIREBASE_STORAGE_EMULATOR_HOST was set in production env. Removing it to prevent connecting to local emulator.');
    delete process.env.FIREBASE_STORAGE_EMULATOR_HOST;
  }
}

let credential;
console.log('Initializing Firebase Admin with config:', {
  NODE_ENV: process.env.NODE_ENV,
  projectId: process.env.FIREBASE_PROJECT_ID || 'undefined',
  hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
  hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
  hasGoogleAppCreds: !!process.env.GOOGLE_APPLICATION_CREDENTIALS,
  emulatorHost: process.env.FIRESTORE_EMULATOR_HOST || 'none'
});

if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.log('Firebase Admin: Using GOOGLE_APPLICATION_CREDENTIALS');
  credential = admin.credential.applicationDefault();
} else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
  console.log('Firebase Admin: Attempting to use service account cert credential');
  let privateKey = process.env.FIREBASE_PRIVATE_KEY.trim();
  // Clean surrounding quotes if any
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1);
  }
  if (privateKey.startsWith("'") && privateKey.endsWith("'")) {
    privateKey = privateKey.slice(1, -1);
  }
  privateKey = privateKey.replace(/\\n/g, '\n');
  
  credential = admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey,
  });
} else {
  console.warn('Firebase Admin: Missing service account credentials. Falling back to applicationDefault()');
  credential = admin.credential.applicationDefault();
}

const bucketName = process.env.FIREBASE_STORAGE_BUCKET || (process.env.FIREBASE_PROJECT_ID ? `${process.env.FIREBASE_PROJECT_ID}.appspot.com` : undefined);
const appConfig = { credential };
if (process.env.FIREBASE_PROJECT_ID) {
  appConfig.projectId = process.env.FIREBASE_PROJECT_ID;
}
if (bucketName) {
  appConfig.storageBucket = bucketName;
}

const app = admin.initializeApp(appConfig);
const db = admin.firestore();
let storage = null;

if (bucketName) {
  try {
    storage = admin.storage().bucket(bucketName);
  } catch (error) {
    console.error(`Firebase Storage bucket initialization failed: ${error.message}`);
    storage = null;
  }
} else {
  console.warn('Firebase storage bucket is not configured. Uploads will not work until FIREBASE_STORAGE_BUCKET is set.');
}

export { db, storage, app };
