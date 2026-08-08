# Cloudinary Setup Guide (Legacy)

> This setup guide is legacy documentation. The current project now uses Firebase Storage for image uploads.

## 1. Create Cloudinary Account

1. Visit https://cloudinary.com/users/register/free
2. Sign up with your email
3. Verify your account
4. Navigate to **Dashboard** (top right corner)
5. Copy your credentials:
   - **Cloud Name**: Displayed on dashboard
   - **API Key**: Displayed on dashboard  
   - **API Secret**: Click "Show" button to reveal

## 2. Update Environment Variables

Add your Cloudinary credentials to `backend/.env`:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

## 3. Install Dependencies

```bash
cd backend
npm install
```

The cloudinary package has been added to package.json.

## 4. Using Cloudinary in Your Controllers

### Basic Upload Example

```javascript
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/uploadToCloudinary.js';
import { upload } from '../middleware/multer.js';

// Use upload middleware on route:
// router.post('/upload', upload.single('image'), uploadController);

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const result = await uploadToCloudinary(req.file.path, 'wedvenue/venues');
    
    res.status(200).json({
      message: 'Image uploaded successfully',
      imageUrl: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

### Delete Image Example

```javascript
export const deleteImage = async (req, res) => {
  try {
    const { publicId } = req.body;
    await deleteFromCloudinary(publicId);
    
    res.status(200).json({ message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

## 5. Creating Upload Routes

### Example Venue Image Upload Route

```javascript
// routes/venueUpload.js
import express from 'express';
import { upload } from '../middleware/multer.js';
import { uploadVenueImage } from '../controllers/venueUploadController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Only organizers and admins can upload venue images
router.post(
  '/upload-venue-image',
  protect,
  authorize('Organizer', 'Admin'),
  upload.single('image'),
  uploadVenueImage
);

export default router;
```

## 6. File Structure

Created files:
```
backend/src/
├── config/
│   └── cloudinary.js          # Cloudinary configuration
├── middleware/
│   └── multer.js              # Multer file upload middleware
└── utils/
    └── uploadToCloudinary.js   # Upload/delete utility functions
```

## 7. Cloudinary Folders

Images will be organized in Cloudinary dashboard:
- `wedvenue/venues` - Venue images
- `wedvenue/users` - User profile images (for future use)
- `wedvenue/reviews` - Review images (for future use)

## Next Steps

1. ✅ Cloudinary account created
2. ✅ Credentials added to .env
3. ✅ Upload utilities created
4. Create venue image upload controller in Phase 2
5. Integrate upload into Organizer Dashboard
6. Add file upload UI in frontend

## Troubleshooting

**"Cloudinary credentials not set"**
- Ensure .env has CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
- Restart backend server: `npm run dev`

**"File too large"**
- Default limit is 10MB
- Edit `backend/src/middleware/multer.js` to change `limits.fileSize`

**"Only image files are allowed"**
- Current setup accepts: JPEG, PNG, GIF, WebP
- Allowed types defined in `backend/src/middleware/multer.js`
