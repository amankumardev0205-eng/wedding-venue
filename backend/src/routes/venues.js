import express from 'express';
import { check } from 'express-validator';
import {
  getVenues,
  getVenueById,
  getVenuesByCity,
  createVenue,
  updateVenue,
  deleteVenue,
} from '../controllers/venueController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getVenues);
router.get('/city/:city', getVenuesByCity);
router.get('/:id', getVenueById);

// Protected routes (Organizer only)
router.post(
  '/',
  protect,
  authorize('organizer', 'admin'),
  [
    check('name', 'Name is required').notEmpty(),
    check('description', 'Description is required').notEmpty(),
    check('city', 'City is required').notEmpty(),
    check('venueType', 'Valid venue type is required').isIn([
      'banquet',
      'resort',
      'lawn',
      'hotel',
      'club',
      'other',
    ]),
    check('capacity.max', 'Capacity is required').isNumeric(),
  ],
  createVenue
);

router.put('/:id', protect, authorize('organizer', 'admin'), updateVenue);
router.delete('/:id', protect, authorize('organizer', 'admin'), deleteVenue);

export default router;
