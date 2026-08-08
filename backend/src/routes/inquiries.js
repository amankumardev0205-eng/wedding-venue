import express from 'express';
import { check } from 'express-validator';
import {
  createInquiry,
  getInquiries,
  getInquiryById,
  updateInquiryStatus,
  markDateUnavailable,
  deleteInquiry,
} from '../controllers/inquiryController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all inquiries (based on role)
router.get('/', protect, getInquiries);

// Get inquiry by ID
router.get('/:id', protect, getInquiryById);

// Create new inquiry (Customer only)
router.post(
  '/',
  protect,
  authorize('customer', 'admin'),
  [
    check('venueId', 'Venue ID is required').notEmpty(),
    check('eventDate', 'Event date is required').isISO8601(),
    check('guestCount', 'Guest count must be a number').isNumeric(),
    check('eventType', 'Event type is required').isIn(['wedding', 'engagement', 'reception', 'other']),
  ],
  createInquiry
);

// Update inquiry status (Organizer/Admin)
router.put(
  '/:id/status',
  protect,
  authorize('organizer', 'admin'),
  [check('status', 'Status is required').isIn(['pending', 'accepted', 'rejected'])],
  updateInquiryStatus
);

// Mark date unavailable (Organizer)
router.put('/:id/mark-unavailable', protect, authorize('organizer', 'admin'), markDateUnavailable);

// Delete inquiry (Customer/Admin)
router.delete('/:id', protect, deleteInquiry);

export default router;
