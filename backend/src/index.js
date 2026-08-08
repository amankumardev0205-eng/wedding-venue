import functions from 'firebase-functions';
import app from './app.js';

export const api = functions.region('us-central1').https.onRequest(app);
