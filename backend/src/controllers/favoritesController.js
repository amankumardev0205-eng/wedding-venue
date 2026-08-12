import User from '../models/User.js';
import Venue from '../models/Venue.js';

// @route   POST /api/favorites/:venueId
// @desc    Add venue to favorites
// @access  Private
export const addToFavorites = async (req, res) => {
  try {
    const { venueId } = req.params;

    // Check if venue exists
    const venue = await Venue.findById(venueId);
    if (!venue) {
      return res.status(404).json({ success: false, message: 'Venue not found' });
    }

    const user = await User.findById(req.user.id);

    if (!user.favorites) {
      user.favorites = [];
    }

    // Check if already in favorites
    if (user.favorites.includes(venueId)) {
      return res.status(400).json({ success: false, message: 'Venue already in favorites' });
    }

    user.favorites.push(venueId);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Venue added to favorites',
      favorites: user.favorites,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/favorites/:venueId
// @desc    Remove venue from favorites
// @access  Private
export const removeFromFavorites = async (req, res) => {
  try {
    const { venueId } = req.params;

    const user = await User.findById(req.user.id);

    if (!user.favorites) {
      user.favorites = [];
    }

    // Check if in favorites
    if (!user.favorites.includes(venueId)) {
      return res.status(400).json({ success: false, message: 'Venue not in favorites' });
    }

    user.favorites = user.favorites.filter((id) => id.toString() !== venueId);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Venue removed from favorites',
      favorites: user.favorites,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/favorites
// @desc    Get all favorite venues
// @access  Private
export const getFavorites = async (req, res) => {
  try {
    const pageNumber = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limitNumber = Math.min(Math.max(parseInt(req.query.limit, 10) || 12, 1), 50);
    const { search = '', city = '', sort = 'saved' } = req.query;
    const user = await User.findById(req.user.id);
    if (user) {
      await user.populate('favorites');
    }
    let favorites = user?.favorites || [];

    if (search) {
      const searchTerm = String(search).toLowerCase();
      favorites = favorites.filter((venue) =>
        [venue.name, venue.description, venue.venueType]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(searchTerm))
      );
    }

    if (city) {
      const cityTerm = String(city).toLowerCase();
      favorites = favorites.filter((venue) => String(venue.city || '').toLowerCase().includes(cityTerm));
    }

    const getVenuePrice = (venue) => Number(venue.pricing?.perPlate || venue.pricing?.flatRate || 0);
    favorites = [...favorites].sort((a, b) => {
      if (sort === 'name') return String(a.name || '').localeCompare(String(b.name || ''));
      if (sort === 'rating') return Number(b.rating || 0) - Number(a.rating || 0);
      if (sort === 'price-low') return getVenuePrice(a) - getVenuePrice(b);
      if (sort === 'price-high') return getVenuePrice(b) - getVenuePrice(a);
      return 0;
    });

    const total = favorites.length;
    const totalPages = Math.max(Math.ceil(total / limitNumber), 1);
    const paginatedFavorites = favorites.slice((pageNumber - 1) * limitNumber, pageNumber * limitNumber);

    res.status(200).json({
      success: true,
      count: paginatedFavorites.length,
      total,
      totalPages,
      currentPage: pageNumber,
      limit: limitNumber,
      favorites: paginatedFavorites,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/favorites/:venueId
// @desc    Check if venue is in favorites
// @access  Private
export const isFavorite = async (req, res) => {
  try {
    const { venueId } = req.params;

    const user = await User.findById(req.user.id);
    const isFav = user.favorites ? user.favorites.includes(venueId) : false;

    res.status(200).json({
      success: true,
      isFavorite: isFav,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
