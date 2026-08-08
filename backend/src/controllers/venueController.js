import Venue from '../models/Venue.js';
import { validationResult } from 'express-validator';
import validator from 'validator';

// @route   GET /api/venues
// @desc    Get all venues with search and filters
// @access  Public
export const getVenues = async (req, res) => {
  try {
    const {
      state,
      city,
      search,
      venueType,
      minPrice,
      maxPrice,
      minCapacity,
      maxCapacity,
      minRating,
      amenities,
      indoor,
      outdoor,
      lat,
      lng,
      radiusKm,
      sort,
      page = 1,
      limit = 12,
    } = req.query;
    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 50);

    let filter = { isActive: true };
    const andConditions = [];

    if (state) {
      andConditions.push({ state: { $regex: state, $options: 'i' } });
    }

    if (city) {
      andConditions.push({ city: { $regex: city, $options: 'i' } });
    }

    if (search) {
      andConditions.push({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ],
      });
    }

    if (venueType) {
      andConditions.push({
        $or: [
          { venueType: venueType },
          { type: { $regex: `^${venueType}$`, $options: 'i' } }
        ],
      });
    }

    if (minPrice || maxPrice) {
      const minP = minPrice ? parseInt(minPrice, 10) : 0;
      const maxP = maxPrice ? parseInt(maxPrice, 10) : Infinity;
      andConditions.push({
        $or: [
          {
            'pricing.perPlate': {
              $gte: minP,
              $lte: maxP,
            },
          },
          {
            'pricing.flatRate': {
              $gte: minP,
              $lte: maxP,
            },
          },
          {
            'pricing.base': {
              $gte: minP,
              $lte: maxP,
            },
          },
          {
            'pricing.buffet': {
              $gte: minP,
              $lte: maxP,
            },
          },
        ],
      });
    }

    if (minCapacity || maxCapacity) {
      const capConditions = [];
      if (minCapacity && maxCapacity) {
        const minCap = parseInt(minCapacity, 10);
        const maxCap = parseInt(maxCapacity, 10);
        capConditions.push({
          $or: [
            {
              $and: [
                { 'capacity.max': { $gte: minCap } },
                { 'capacity.min': { $lte: maxCap } },
              ],
            },
            {
              $and: [
                { capacity: { $gte: minCap } },
                { capacity: { $lte: maxCap } },
              ],
            },
          ],
        });
      } else if (minCapacity) {
        const minCap = parseInt(minCapacity, 10);
        capConditions.push({
          $or: [
            { 'capacity.max': { $gte: minCap } },
            { capacity: { $gte: minCap } },
          ],
        });
      } else if (maxCapacity) {
        const maxCap = parseInt(maxCapacity, 10);
        capConditions.push({
          $or: [
            { 'capacity.min': { $lte: maxCap } },
            { capacity: { $lte: maxCap } },
          ],
        });
      }
      andConditions.push(...capConditions);
    }

    if (minRating) {
      andConditions.push({ rating: { $gte: parseFloat(minRating) } });
    }

    if (indoor === 'true') {
      andConditions.push({ indoor: true });
    }
    if (outdoor === 'true') {
      andConditions.push({ outdoor: true });
    }

    if (andConditions.length > 0) {
      filter.$and = andConditions;
    }

    // Whitelist and map allowed sorting options
    const allowedSorts = {
      'rating-desc': { rating: -1, createdAt: -1 },
      'price-asc': { 'pricing.perPlate': 1, 'pricing.flatRate': 1 },
      'price-desc': { 'pricing.perPlate': -1, 'pricing.flatRate': -1 },
      'capacity-asc': { 'capacity.max': 1 },
      'capacity-desc': { 'capacity.max': -1 }
    };

    // Default sorting: Rating high-to-low and newest first
    let sortObj = { rating: -1, createdAt: -1 };
    if (sort && allowedSorts[sort]) {
      sortObj = allowedSorts[sort];
    }

    // Initial fetch using query-based filtering supported by the FirestoreModel QueryBuilder
    let venues = await Venue.find(filter)
      .populate('organizer', 'name email')
      .sort(sortObj)
      .lean();

    // Amenities filtering: client may send comma-separated amenities
    if (amenities) {
      let amenList = Array.isArray(amenities) ? amenities : String(amenities).split(',').map((a) => a.trim().toLowerCase());
      // Map 'sound' filter value to 'sound_system'
      amenList = amenList.map((a) => (a === 'sound' ? 'sound_system' : a));

      venues = venues.filter((v) => {
        const vAmenities = (v.amenities || []).map((a) => String(a).toLowerCase());
        // require that venue has ALL requested amenities; handle 'sound_system' mapping checking either
        return amenList.every((a) => {
          if (a === 'sound_system') {
            return vAmenities.includes('sound_system') || vAmenities.includes('sound');
          }
          return vAmenities.includes(a);
        });
      });
    }

    // Geo-radius filtering (lat,lng in decimal degrees, radiusKm numeric)
    if (lat && lng && radiusKm) {
      const toRad = (deg) => (deg * Math.PI) / 180;
      const R = 6371; // Earth's radius in km
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);
      const rKm = parseFloat(radiusKm);

      venues = venues.filter((v) => {
        const coords = v.coordinates || v.location || null;
        let vLat = null;
        let vLng = null;
        if (!coords) return false;
        if (Array.isArray(coords) && coords.length >= 2) {
          vLat = parseFloat(coords[0]);
          vLng = parseFloat(coords[1]);
        } else if (coords.lat != null && coords.lng != null) {
          vLat = parseFloat(coords.lat);
          vLng = parseFloat(coords.lng);
        } else if (coords.latitude != null && coords.longitude != null) {
          vLat = parseFloat(coords.latitude);
          vLng = parseFloat(coords.longitude);
        } else {
          return false;
        }

        if (Number.isNaN(vLat) || Number.isNaN(vLng)) return false;

        const dLat = toRad(vLat - latNum);
        const dLon = toRad(vLng - lngNum);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(latNum)) * Math.cos(toRad(vLat)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distanceKm = R * c;

        return distanceKm <= rKm;
      });
    }

    const total = venues.length;
    const totalPages = Math.max(Math.ceil(total / limitNumber), 1);
    const paginatedVenues = venues.slice((pageNumber - 1) * limitNumber, pageNumber * limitNumber);

    res.status(200).json({
      success: true,
      count: paginatedVenues.length,
      total,
      totalPages,
      currentPage: pageNumber,
      limit: limitNumber,
      venues: paginatedVenues,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/venues/:id
// @desc    Get venue by ID
// @access  Public
export const getVenueById = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id);

    if (!venue) {
      return res.status(404).json({ success: false, message: 'Venue not found' });
    }

    await venue.populate('organizer', 'name email');
    await venue.populate('reviews');

    res.status(200).json({ success: true, venue });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/venues/city/:city
// @desc    Get venues by city
// @access  Public
export const getVenuesByCity = async (req, res) => {
  try {
    const { city } = req.params;
    const venues = await Venue.find({ city: { $regex: city, $options: 'i' }, isActive: true })
      .populate('organizer', 'name email')
      .sort({ rating: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: venues.length,
      venues,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/venues
// @desc    Create new venue (Organizer only)
// @access  Private
export const createVenue = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { name, description, city, address, coordinates, venueType, capacity, pricing, amenities, indoor, outdoor, images } = req.body;

    // Validate image URLs using the validator package
    if (images && images.length > 0) {
      for (const img of images) {
        if (img.url && !validator.isURL(img.url, { require_protocol: true })) {
          return res.status(400).json({ success: false, message: 'Invalid image URL provided.' });
        }
      }
    }

    const venue = new Venue({
      name,
      description,
      city: city.toLowerCase(),
      address,
      coordinates,
      venueType,
      capacity,
      pricing,
      amenities,
      indoor,
      outdoor,
      images: images || [],
      organizer: req.user.id,
    });

    await venue.save();
    await venue.populate('organizer', 'name email');

    res.status(201).json({
      success: true,
      message: 'Venue created successfully',
      venue,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/venues/:id
// @desc    Update venue (Organizer only)
// @access  Private
export const updateVenue = async (req, res) => {
  try {
    let venue = await Venue.findById(req.params.id);

    if (!venue) {
      return res.status(404).json({ success: false, message: 'Venue not found' });
    }

    // Check ownership
    if (venue.organizer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this venue' });
    }

    // Validate image URLs if they are being updated
    if (req.body.images && req.body.images.length > 0) {
      for (const img of req.body.images) {
        if (img.url && !validator.isURL(img.url, { require_protocol: true })) {
          return res.status(400).json({ success: false, message: 'Invalid image URL provided.' });
        }
      }
    }

    venue = await Venue.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (venue) {
      await venue.populate('organizer', 'name email');
    }

    res.status(200).json({
      success: true,
      message: 'Venue updated successfully',
      venue,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/venues/:id
// @desc    Delete venue (Organizer only)
// @access  Private
export const deleteVenue = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id);

    if (!venue) {
      return res.status(404).json({ success: false, message: 'Venue not found' });
    }

    // Check ownership
    if (venue.organizer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this venue' });
    }

    await Venue.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Venue deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
