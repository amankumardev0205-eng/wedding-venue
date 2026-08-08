import express from 'express';
import {
  getOrganizerVenues,
  createVenue,
  updateVenue,
  deleteVenue,
  getVenueForEdit,
} from '../controllers/venueManagementController.js';
import { protect, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/multer.js';

const router = express.Router();

// All routes require authentication and organizer/admin role
router.use(protect);
router.use(authorize('organizer', 'admin'));

// Get all venues for logged-in organizer
router.get('/', getOrganizerVenues);

// Create new venue with image upload
router.post('/', upload.single('image'), createVenue);

// Get single venue for editing
router.get('/:venueId', getVenueForEdit);

// Update venue
router.put('/:venueId', upload.single('image'), updateVenue);

// Delete venue
router.delete('/:venueId', deleteVenue);

export default router;
