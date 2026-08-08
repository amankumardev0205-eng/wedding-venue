import path from 'path';
import { fileURLToPath } from 'url';
import admin from 'firebase-admin';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

let credential;
if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  credential = admin.credential.applicationDefault();
} else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY && !process.env.FIRESTORE_EMULATOR_HOST) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
  credential = admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey,
  });
} else {
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
