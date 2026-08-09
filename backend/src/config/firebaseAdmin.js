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
let privateKeyInput = (process.env.FIREBASE_PRIVATE_KEY || '').trim();
let clientEmailInput = (process.env.FIREBASE_CLIENT_EMAIL || '').trim();
let projectIdInput = (process.env.FIREBASE_PROJECT_ID || '').trim();

// Check if they pasted the entire serviceAccountKey.json content into FIREBASE_PRIVATE_KEY
if (privateKeyInput.startsWith('{') && privateKeyInput.endsWith('}')) {
  try {
    const credsJson = JSON.parse(privateKeyInput);
    console.log('Firebase Admin: Detected JSON format in FIREBASE_PRIVATE_KEY. Extracting credential fields...');
    if (credsJson.project_id) projectIdInput = credsJson.project_id;
    if (credsJson.client_email) clientEmailInput = credsJson.client_email;
    if (credsJson.private_key) privateKeyInput = credsJson.private_key;
  } catch (e) {
    console.error('Firebase Admin: Failed to parse FIREBASE_PRIVATE_KEY as JSON:', e.message);
  }
}

console.log('Initializing Firebase Admin with config:', {
  NODE_ENV: process.env.NODE_ENV,
  projectId: projectIdInput || 'undefined',
  clientEmail: clientEmailInput || 'undefined',
  hasPrivateKey: !!privateKeyInput,
  hasGoogleAppCreds: !!process.env.GOOGLE_APPLICATION_CREDENTIALS,
  emulatorHost: process.env.FIRESTORE_EMULATOR_HOST || 'none'
});

if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.log('Firebase Admin: Using GOOGLE_APPLICATION_CREDENTIALS');
  credential = admin.credential.applicationDefault();
} else if (projectIdInput && clientEmailInput && privateKeyInput) {
  console.log('Firebase Admin: Attempting to use service account cert credential');
  
  // Extract key based on PEM header boundaries to automatically discard any JSON labels, quotes, spaces, or trailing commas
  const startHeader = '-----BEGIN PRIVATE KEY-----';
  const endHeader = '-----END PRIVATE KEY-----';
  
  // We do the indexOf check first on the normalized string (handling both escaped \n and actual newlines)
  const normalizedKey = privateKeyInput.replace(/\\n/g, '\n');
  const startIndex = normalizedKey.indexOf(startHeader);
  const endIndex = normalizedKey.indexOf(endHeader);
  
  if (startIndex !== -1 && endIndex !== -1) {
    privateKeyInput = normalizedKey.substring(startIndex, endIndex + endHeader.length);
  } else {
    // Fallback: if headers are not found in the normalized string, try to clean quotes and trailing characters from the original string
    if (privateKeyInput.startsWith('"') && privateKeyInput.endsWith('"')) {
      privateKeyInput = privateKeyInput.slice(1, -1);
    }
    if (privateKeyInput.startsWith("'") && privateKeyInput.endsWith("'")) {
      privateKeyInput = privateKeyInput.slice(1, -1);
    }
    privateKeyInput = privateKeyInput.replace(/\\n/g, '\n');
  }

  // Verify private key format
  const startsWithBegin = privateKeyInput.includes('-----BEGIN PRIVATE KEY-----');
  const endsWithEnd = privateKeyInput.includes('-----END PRIVATE KEY-----');
  console.log('Private key format verification:', {
    length: privateKeyInput.length,
    containsBeginHeader: startsWithBegin,
    containsEndHeader: endsWithEnd,
    pastedCorrectly: startsWithBegin && endsWithEnd
  });

  if (!startsWithBegin || !endsWithEnd) {
    console.error('CRITICAL WARNING: The private key is malformed. It must include both the "-----BEGIN PRIVATE KEY-----" and "-----END PRIVATE KEY-----" headers and not be truncated.');
  }

  credential = admin.credential.cert({
    projectId: projectIdInput,
    clientEmail: clientEmailInput,
    privateKey: privateKeyInput,
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
