import express from 'express';
import { getBookingById, getBookingICS } from '../controllers/bookingController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/:id', protect, getBookingById);
router.get('/:id/ics', protect, getBookingICS);

export default router;
