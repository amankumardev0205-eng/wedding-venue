import Venue from '../models/Venue.js';
import User from '../models/User.js';
import { uploadToFirebaseStorage, deleteFromFirebaseStorage } from '../utils/firebaseStorage.js';

// Get all venues for an organizer
export const getOrganizerVenues = async (req, res) => {
  try {
    const organizerId = req.user.id;
    const venues = await Venue.find({ organizer: organizerId }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: venues.length,
      venues: venues,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new venue
export const createVenue = async (req, res) => {
  try {
    const {
      name,
      city,
      type,
      capacity,
      description,
      amenities,
      pricing,
      location,
    } = req.body;

    // Validate required fields
    if (!name || !city || !type || !capacity) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, city, type, and capacity',
      });
    }

    // Parse amenities and pricing from JSON string if needed
    let amenitiesArray = amenities;
    let pricingObj = pricing;

    if (typeof amenities === 'string') {
      amenitiesArray = JSON.parse(amenities);
    }
    if (typeof pricing === 'string') {
      pricingObj = JSON.parse(pricing);
    }

    // Handle image upload
    let images = [];
    if (req.file) {
      const result = await uploadToFirebaseStorage(req.file.path, 'wedvenue/venues');
      images.push({
        url: result.url,
        publicId: result.publicId,
      });
    }

    // Standardize Capacity
    const capacityNum = parseInt(capacity, 10);
    const capacityObj = {
      min: Math.max(10, Math.round(capacityNum * 0.25)),
      max: capacityNum
    };

    // Standardize Pricing
    const baseP = pricingObj?.base || 0;
    const isFlatRateType = ['garden', 'lawn', 'banquet', 'banquet hall', 'club', 'beach', 'farm house'].includes(String(type || '').toLowerCase());
    const pricingObjStandard = {
      perPlate: isFlatRateType ? 0 : Number(baseP),
      flatRate: isFlatRateType ? Number(baseP) : 0
    };

    // Standardize Venue Type
    const standardVenueType = String(type || '').toLowerCase();

    // Create venue
    const venue = new Venue({
      name,
      city: city.toLowerCase(),
      type, // legacy
      venueType: standardVenueType, // standard
      capacity: capacityObj, // standard
      pricing: pricingObjStandard, // standard
      description,
      amenities: amenitiesArray || [],
      location: location || {},
      organizer: req.user.id,
      images: images,
      rating: 0,
      reviews: [],
    });

    await venue.save();

    res.status(201).json({
      success: true,
      message: 'Venue created successfully',
      venue: venue,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update a venue
export const updateVenue = async (req, res) => {
  try {
    const { venueId } = req.params;
    const organizerId = req.user.id;

    // Check if venue exists and user is owner
    const venue = await Venue.findById(venueId);
    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found',
      });
    }

    if (venue.organizer.toString() !== organizerId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this venue',
      });
    }

    // Parse amenities and pricing from JSON string if needed
    let amenities = req.body.amenities;
    let pricing = req.body.pricing;

    if (typeof amenities === 'string') {
      amenities = JSON.parse(amenities);
    }
    if (typeof pricing === 'string') {
      pricing = JSON.parse(pricing);
    }

    // Handle image upload if new image provided
    let images = venue.images;
    if (req.file) {
      // Delete old image if exists
      if (venue.images.length > 0) {
        await deleteFromFirebaseStorage(venue.images[0].publicId);
      }

      // Upload new image
      const result = await uploadToFirebaseStorage(req.file.path, 'wedvenue/venues');
      images = [
        {
          url: result.url,
          publicId: result.publicId,
        },
      ];
    }

    // Standardize capacity on update
    let capacityObj = venue.capacity;
    if (req.body.capacity) {
      const capNum = parseInt(req.body.capacity, 10);
      capacityObj = {
        min: Math.max(10, Math.round(capNum * 0.25)),
        max: capNum
      };
    }

    // Standardize pricing on update
    let pricingObjStandard = venue.pricing;
    if (pricing) {
      const basePrice = pricing.base || 0;
      const t = req.body.type || venue.type || '';
      const isFlatRateType = ['garden', 'lawn', 'banquet', 'banquet hall', 'club', 'beach', 'farm house'].includes(String(t).toLowerCase());
      pricingObjStandard = {
        perPlate: isFlatRateType ? 0 : Number(basePrice),
        flatRate: isFlatRateType ? Number(basePrice) : 0
      };
    }

    // Standardize type / venueType on update
    const typeVal = req.body.type || venue.type;
    const venueTypeVal = typeVal ? String(typeVal).toLowerCase() : venue.venueType;

    // Update venue
    const updatedVenue = await Venue.findByIdAndUpdate(
      venueId,
      {
        name: req.body.name || venue.name,
        city: req.body.city || venue.city,
        type: typeVal,
        venueType: venueTypeVal,
        capacity: capacityObj,
        pricing: pricingObjStandard,
        description: req.body.description || venue.description,
        amenities: amenities || venue.amenities,
        location: req.body.location || venue.location,
        images: images,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Venue updated successfully',
      venue: updatedVenue,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete a venue
export const deleteVenue = async (req, res) => {
  try {
    const { venueId } = req.params;
    const organizerId = req.user.id;

    // Check if venue exists and user is owner
    const venue = await Venue.findById(venueId);
    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found',
      });
    }

    if (venue.organizer.toString() !== organizerId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this venue',
      });
    }

    // Delete images from Firebase Storage
    for (const image of venue.images) {
      await deleteFromFirebaseStorage(image.publicId);
    }

    // Delete venue
    await Venue.findByIdAndDelete(venueId);

    res.status(200).json({
      success: true,
      message: 'Venue deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single venue for organizer (for editing)
export const getVenueForEdit = async (req, res) => {
  try {
    const { venueId } = req.params;
    const organizerId = req.user.id;

    const venue = await Venue.findById(venueId);
    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found',
      });
    }

    if (venue.organizer.toString() !== organizerId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this venue',
      });
    }

    res.status(200).json({
      success: true,
      venue: venue,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
