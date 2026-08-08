import fs from 'fs';
import path from 'path';
import { storage } from '../config/firebaseAdmin.js';

export const uploadToFirebaseStorage = async (filePath, folder = 'wedvenue/venues') => {
  const fileName = `${folder}/${Date.now()}-${path.basename(filePath)}`;

  await storage.upload(filePath, {
    destination: fileName,
    metadata: {
      contentType: 'image/jpeg',
    },
  });

  const file = storage.file(fileName);

  try {
    let url;
    if (process.env.FIREBASE_STORAGE_EMULATOR_HOST) {
      const bucket = storage.name;
      const encodedPath = encodeURIComponent(fileName);
      url = `http://${process.env.FIREBASE_STORAGE_EMULATOR_HOST}/v0/b/${bucket}/o/${encodedPath}?alt=media`;
    } else {
      const [signedUrl] = await file.getSignedUrl({
        action: 'read',
        expires: '03-01-2500',
      });
      url = signedUrl;
    }

    return {
      url,
      publicId: fileName,
    };
  } finally {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
};

export const deleteFromFirebaseStorage = async (publicId) => {
  if (!publicId) {
    return;
  }

  const file = storage.file(publicId);
  try {
    await file.delete({ ignoreNotFound: true });
  } catch (error) {
    throw new Error(`Firebase Storage delete failed: ${error.message}`);
  }
};
