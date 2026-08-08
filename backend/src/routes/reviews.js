import express from 'express';
import { check } from 'express-validator';
import {
  createReview,
  getVenueReviews,
  getReviewById,
  updateReview,
  deleteReview,
  addOrganizerReply,
  markHelpful,
  summarizeReview,
} from '../controllers/reviewController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/venue/:venueId', getVenueReviews);
router.get('/:id', getReviewById);

// Protected routes
router.post(
  '/',
  protect,
  authorize('customer', 'admin'),
  [
    check('venueId', 'Venue ID is required').notEmpty(),
    check('rating', 'Rating must be between 1 and 5').isInt({ min: 1, max: 5 }),
    check('title', 'Title is required').notEmpty(),
    check('comment', 'Comment is required').notEmpty(),
  ],
  createReview
);

router.put(
  '/:id',
  protect,
  [
    check('rating', 'Rating must be between 1 and 5').optional().isInt({ min: 1, max: 5 }),
    check('title', 'Title is required').optional().notEmpty(),
    check('comment', 'Comment is required').optional().notEmpty(),
  ],
  updateReview
);

router.delete('/:id', protect, deleteReview);

router.put('/:id/reply', protect, authorize('organizer', 'admin'), addOrganizerReply);

router.put('/:id/helpful', protect, markHelpful);
router.post('/:id/summarize', protect, summarizeReview);

export default router;
