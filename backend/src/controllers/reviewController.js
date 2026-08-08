import Review from '../models/Review.js';
import Venue from '../models/Venue.js';
import Inquiry from '../models/Inquiry.js';
import { validationResult } from 'express-validator';

// @route   POST /api/reviews
// @desc    Create new review
// @access  Private (Customer only)
export const createReview = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { venueId, rating, title, comment } = req.body;

    // Check if venue exists
    const venue = await Venue.findById(venueId);
    if (!venue) {
      return res.status(404).json({ success: false, message: 'Venue not found' });
    }

    // Check if user already reviewed this venue
    const existingReview = await Review.findOne({
      customer: req.user.id,
      venue: venueId,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this venue',
      });
    }

    // Check if user has accepted inquiry for this venue (for verification)
    const acceptedInquiry = await Inquiry.findOne({
      customer: req.user.id,
      venue: venueId,
      status: 'accepted',
    });

    const isVerified = !!acceptedInquiry;

    // Basic spam detection heuristics
    const text = `${title || ''} ${comment || ''}`.toLowerCase();
    const blacklisted = ['buy now', 'free', 'visit my', 'cheap', 'http://', 'https://'];
    const hasBlacklisted = blacklisted.some((w) => text.includes(w));
    const shortText = text.replace(/\s+/g, ' ').trim();
    const repeatedChars = /(.)\1{10,}/.test(shortText);

    const review = new Review({
      customer: req.user.id,
      venue: venueId,
      rating,
      title,
      comment,
      isVerified,
      isFlagged: hasBlacklisted || repeatedChars || (shortText.length < 10),
    });

    await review.save();
    await review.populate('customer', 'name');
    await review.populate('venue', 'name');

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      review,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/reviews/venue/:venueId
// @desc    Get reviews for a venue
// @access  Public
export const getVenueReviews = async (req, res) => {
  try {
    const { venueId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({ venue: venueId })
      .populate('customer', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Review.countDocuments({ venue: venueId });

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

// @route   GET /api/reviews/:id
// @desc    Get review by ID
// @access  Public
export const getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('customer', 'name')
      .populate('venue', 'name');

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    res.status(200).json({ success: true, review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/reviews/:id
// @desc    Update review
// @access  Private (Review owner only)
export const updateReview = async (req, res) => {
  try {
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Check ownership
    if (review.customer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this review' });
    }

    const { rating, title, comment } = req.body;

    review = await Review.findByIdAndUpdate(
      req.params.id,
      { rating, title, comment },
      { new: true, runValidators: true }
    );
    if (review) {
      await review.populate('customer', 'name');
      await review.populate('venue', 'name');
    }

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      review,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/reviews/:id
// @desc    Delete review
// @access  Private (Review owner or Admin)
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Check authorization
    if (review.customer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/reviews/:id/reply
// @desc    Add organizer reply to review
// @access  Private (Organizer/Admin)
export const addOrganizerReply = async (req, res) => {
  try {
    const { comment } = req.body;

    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Check authorization - organizer of the venue or admin
    const venue = await Venue.findById(review.venue);
    if (venue.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reply to this review',
      });
    }

    review.organizerReply = {
      comment,
      repliedAt: new Date(),
    };

    await review.save();
    await review.populate('customer', 'name');
    await review.populate('venue', 'name');

    res.status(200).json({
      success: true,
      message: 'Reply added successfully',
      review,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/reviews/:id/helpful
// @desc    Mark review as helpful
// @access  Private
export const markHelpful = async (req, res) => {
  try {
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    review.helpful += 1;
    review = await review.save();
    await review.populate('customer', 'name');
    await review.populate('venue', 'name');

    res.status(200).json({
      success: true,
      message: 'Review marked as helpful',
      review,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/reviews/:id/summarize
// @desc  Generate a short summary of the review (naive local summarization)
// @access Public
export const summarizeReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id).lean();
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    const text = `${review.title || ''}. ${review.comment || ''}`.trim();
    if (!text) return res.status(200).json({ success: true, summary: '' });

    // Very naive summarization: pick the first sentence up to 200 chars
    const sentences = text.split(/(?<=[.!?])\s+/);
    let summary = sentences[0] || text.slice(0, 200);
    if (summary.length > 200) summary = summary.slice(0, 200) + '...';

    res.status(200).json({ success: true, summary });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
