import { app } from './firebaseAdmin.js';

const connectDB = async () => {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID || 'unknown-project';
    console.log(`Firebase initialized for project: ${projectId}`);
    return app;
  } catch (error) {
    console.error(`Error initializing Firebase Admin: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
