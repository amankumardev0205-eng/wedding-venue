import User from '../models/User.js';
import Venue from '../models/Venue.js';
import Review from '../models/Review.js';
import Inquiry from '../models/Inquiry.js';

// @route   GET /api/admin/users
// @desc    Get all users with pagination
// @access  Private (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', role = '' } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('-passwordHash')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })
      .lean();

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/admin/organizers
// @desc    Get all organizers
// @access  Private (Admin only)
export const getAllOrganizers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;

    const query = { role: 'organizer' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const organizers = await User.find(query)
      .select('-passwordHash')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })
      .lean();

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      organizers,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/admin/venues
// @desc    Get all venues for moderation
// @access  Private (Admin only)
export const getAllVenuesForModeration = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];
    }

    const venues = await Venue.find(query)
      .populate('organizer', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })
      .lean();

    const total = await Venue.countDocuments(query);

    res.status(200).json({
      success: true,
      venues,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/admin/venues/:id
// @desc    Remove venue (moderation)
// @access  Private (Admin only)
export const removeVenue = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id);

    if (!venue) {
      return res.status(404).json({ success: false, message: 'Venue not found' });
    }

    await Venue.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Venue removed successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/admin/reviews
// @desc    Get all reviews for moderation
// @access  Private (Admin only)
export const getAllReviewsForModeration = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { comment: { $regex: search, $options: 'i' } },
      ];
    }

    const reviews = await Review.find(query)
      .populate('customer', 'name email')
      .populate('venue', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })
      .lean();

    const total = await Review.countDocuments(query);

    res.status(200).json({
      success: true,
      reviews,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/admin/reviews/:id
// @desc    Remove review (moderation)
// @access  Private (Admin only)
export const removeReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Review removed successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/admin/analytics
// @desc    Get platform analytics
// @access  Private (Admin only)
export const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOrganizers = await User.countDocuments({ role: 'organizer' });
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalVenues = await Venue.countDocuments();
    const totalInquiries = await Inquiry.countDocuments();
    const totalReviews = await Review.countDocuments();

    const acceptedInquiries = await Inquiry.countDocuments({ status: 'accepted' });
    const pendingInquiries = await Inquiry.countDocuments({ status: 'pending' });
    const rejectedInquiries = await Inquiry.countDocuments({ status: 'rejected' });

    const verifiedReviews = await Review.countDocuments({ isVerified: true });
    const averageRating = await Review.aggregate([
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        users: {
          total: totalUsers,
          organizers: totalOrganizers,
          customers: totalCustomers,
        },
        venues: {
          total: totalVenues,
        },
        inquiries: {
          total: totalInquiries,
          accepted: acceptedInquiries,
          pending: pendingInquiries,
          rejected: rejectedInquiries,
        },
        reviews: {
          total: totalReviews,
          verified: verifiedReviews,
          averageRating: averageRating[0]?.avgRating || 0,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
