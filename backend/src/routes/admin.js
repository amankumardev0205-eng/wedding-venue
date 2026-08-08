import express from 'express';
import {
  getAllUsers,
  getAllOrganizers,
  getAllVenuesForModeration,
  removeVenue,
  getAllReviewsForModeration,
  removeReview,
  getAnalytics,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Protect all admin routes - only admins can access
router.use(protect, authorize('admin'));

// User management
router.get('/users', getAllUsers);

// Organizer management
router.get('/organizers', getAllOrganizers);

// Venue moderation
router.get('/venues', getAllVenuesForModeration);
router.delete('/venues/:id', removeVenue);

// Review moderation
router.get('/reviews', getAllReviewsForModeration);
router.delete('/reviews/:id', removeReview);

// Analytics
router.get('/analytics', getAnalytics);

export default router;
