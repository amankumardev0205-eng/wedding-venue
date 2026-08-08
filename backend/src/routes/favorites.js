import express from 'express';
import {
  addToFavorites,
  removeFromFavorites,
  getFavorites,
  isFavorite,
} from '../controllers/favoritesController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get all favorites
router.get('/', protect, getFavorites);

// Check if venue is favorite
router.get('/:venueId', protect, isFavorite);

// Add to favorites
router.post('/:venueId', protect, addToFavorites);

// Remove from favorites
router.delete('/:venueId', protect, removeFromFavorites);

export default router;
