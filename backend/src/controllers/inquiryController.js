import Inquiry from '../models/Inquiry.js';
import Venue from '../models/Venue.js';
import User from '../models/User.js';
import { validationResult } from 'express-validator';
import { getIo } from '../utils/socket.js';
import Booking from '../models/Booking.js';
import { sendEmail } from '../utils/email.js';

// @route   POST /api/inquiries
// @desc    Create new inquiry (Customer only)
// @access  Private
export const createInquiry = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { venueId, eventDate, guestCount, eventType, message } = req.body;

    // Verify venue exists
    const venue = await Venue.findById(venueId);
    if (!venue) {
      return res.status(404).json({ success: false, message: 'Venue not found' });
    }

    // Check guest count is within capacity
    if (guestCount < venue.capacity.min || guestCount > venue.capacity.max) {
      return res.status(400).json({
        success: false,
        message: `Guest count must be between ${venue.capacity.min} and ${venue.capacity.max}`,
      });
    }

    // Check if date is available
    const isUnavailable = (venue.unavailableDates || []).some((range) => {
      const start = range.start.toDate ? range.start.toDate() : new Date(range.start);
      const end = range.end.toDate ? range.end.toDate() : new Date(range.end);
      const targetDate = new Date(eventDate);
      return targetDate >= start && targetDate <= end;
    });

    if (isUnavailable) {
      return res.status(400).json({
        success: false,
        message: 'This date is not available for this venue',
      });
    }

    const inquiry = new Inquiry({
      customer: req.user.id,
      venue: venueId,
      eventDate,
      guestCount,
      eventType,
      message,
      status: 'pending',
    });

    await inquiry.save();
    await inquiry.populate('customer', 'name email');
    await inquiry.populate('venue', 'name city');

    // Add inquiry to user
    await User.findByIdAndUpdate(req.user.id, {
      $push: { inquiries: inquiry._id },
    });

    // Emit real-time event to organizer (venue.organizer) and admin room
    try {
      const io = getIo();
      if (io) {
        // Notify organizer by room (organizer user id)
        io.to(String(venue.organizer)).emit('inquiry:created', { inquiry: inquiry.toObject ? inquiry.toObject() : inquiry });
        // Also broadcast to admin room
        io.to('admins').emit('inquiry:created', { inquiry: inquiry.toObject ? inquiry.toObject() : inquiry });
      }
    } catch (err) {
      // Non-fatal
      console.warn('Socket emit failed', err.message);
    }
    try {
      const { logEvent } = await import('../utils/audit.js');
      logEvent({ action: 'inquiry_created', inquiryId: inquiry.id || inquiry._id, venue: venue.id || venue._id, customer: req.user.id });
    } catch (e) {
      // ignore audit errors
    }

    // Send email to organizer notifying them of new inquiry
    try {
      const organizerUser = await User.findById(venue.organizer);
      if (organizerUser && organizerUser.email) {
        await sendEmail({
          to: organizerUser.email,
          subject: `New Inquiry for ${venue.name}`,
          text: `You have received a new inquiry from ${inquiry.customer.name || 'a customer'} for your venue ${venue.name} on ${new Date(inquiry.eventDate).toDateString()}.`,
        });
      }
    } catch (emailErr) {
      console.warn('Organizer notification email failed', emailErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Inquiry sent successfully',
      inquiry,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/inquiries
// @desc    Get inquiries (Customer gets own, Organizer gets for their venues, Admin gets all)
// @access  Private
export const getInquiries = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);
    const skip = (pageNumber - 1) * limitNumber;

    let filter = {};

    if (req.user.role === 'customer') {
      // Customers see their own inquiries
      filter.customer = req.user.id;
    } else if (req.user.role === 'organizer') {
      // Organizers see inquiries for their venues
      const venues = await Venue.find({ organizer: req.user.id });
      const venueIds = venues.map((v) => v._id);
      filter.venue = { $in: venueIds };
    }
    // Admin sees all inquiries (no filter)

    const total = await Inquiry.countDocuments(filter);
    const totalPages = Math.max(Math.ceil(total / limitNumber), 1);

    const inquiries = await Inquiry.find(filter)
      .populate('customer', 'name email')
      .populate('venue', 'name city')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    res.status(200).json({
      success: true,
      count: inquiries.length,
      total,
      totalPages,
      currentPage: pageNumber,
      limit: limitNumber,
      inquiries,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/inquiries/:id
// @desc    Get inquiry by ID
// @access  Private
export const getInquiryById = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }

    await inquiry.populate('customer', 'name email');
    await inquiry.populate('venue', 'name city');

    // Check authorization
    if (
      req.user.id !== inquiry.customer.toString() &&
      req.user.role !== 'admin'
    ) {
      // Check if user is organizer of the venue
      const venue = await Venue.findById(inquiry.venue._id);
      if (venue.organizer.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized to view this inquiry' });
      }
    }

    res.status(200).json({ success: true, inquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/inquiries/:id/status
// @desc    Update inquiry status (Organizer/Admin only)
// @access  Private
export const updateInquiryStatus = async (req, res) => {
  try {
    const { status, organizerResponse } = req.body;

    if (!['pending', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    let inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }

    // Check authorization - only organizer of the venue or admin
    const venue = await Venue.findById(inquiry.venue);
    if (venue.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this inquiry' });
    }

    inquiry.status = status;
    if (organizerResponse) {
      inquiry.organizerResponse = organizerResponse;
    }
    inquiry.respondedAt = new Date();

    await inquiry.save();
    await inquiry.populate('customer', 'name email');
    await inquiry.populate('venue', 'name city');

    // If accepted, create a booking and mark date unavailable
    if (status === 'accepted') {
      try {
        const booking = new Booking({
          inquiry: inquiry.id || inquiry._id,
          venue: venue.id || venue._id,
          organizer: venue.organizer,
          customer: inquiry.customer.id || inquiry.customer._id || inquiry.customer,
          eventDate: inquiry.eventDate,
          guestCount: inquiry.guestCount,
          eventType: inquiry.eventType,
          venueName: venue.name,
          customerName: inquiry.customer.name || inquiry.customer,
        });

        await booking.save();

        // Attach booking id to inquiry
        inquiry.booking = booking.id || booking._id;
        await inquiry.save();

        // Mark unavailable on venue
        venue.unavailableDates = venue.unavailableDates || [];
        venue.unavailableDates.push({ start: new Date(inquiry.eventDate), end: new Date(inquiry.eventDate) });
        await venue.save();

        // Send email to customer with booking ICS link (best-effort)
        try {
          const customerEmail = inquiry.customer.email;
          if (customerEmail) {
            const base = process.env.FRONTEND_URL || 'http://localhost:5173';
            const icsUrl = `${process.env.VITE_API_URL || 'http://localhost:5000'}/api/bookings/${booking.id || booking._id}/ics`;
            await sendEmail({
              to: customerEmail,
              subject: `Your booking is confirmed at ${venue.name}`,
              text: `Your booking on ${new Date(booking.eventDate).toDateString()} has been confirmed. Download calendar: ${icsUrl}`,
            });
          }
        } catch (emailErr) {
          console.warn('Email send failed', emailErr.message);
        }
        try {
          const { logEvent } = await import('../utils/audit.js');
          logEvent({ action: 'booking_created', bookingId: booking.id || booking._id, inquiryId: inquiry.id || inquiry._id, venue: venue.id || venue._id });
        } catch (e) {
          // noop
        }
      } catch (bookErr) {
        console.warn('Booking creation failed', bookErr.message);
      }
    }

    if (status === 'rejected') {
      try {
        const customerEmail = inquiry.customer.email;
        if (customerEmail) {
          await sendEmail({
            to: customerEmail,
            subject: `Update on your inquiry for ${inquiry.venue.name}`,
            text: `We regret to inform you that your inquiry for ${inquiry.venue.name} on ${new Date(inquiry.eventDate).toDateString()} has been declined by the organizer.`,
          });
        }
      } catch (emailErr) {
        console.warn('Customer rejection notification email failed', emailErr.message);
      }
    }

    res.status(200).json({
      success: true,
      message: `Inquiry ${status} successfully`,
      inquiry,
    });

    // Emit update event to customer and admin
    try {
      const io = getIo();
      if (io) {
        // Notify the customer
        io.to(String(inquiry.customer)).emit('inquiry:updated', { inquiry: inquiry.toObject ? inquiry.toObject() : inquiry });
        // Notify organizer room and admins as well
        io.to(String(venue.organizer)).emit('inquiry:updated', { inquiry: inquiry.toObject ? inquiry.toObject() : inquiry });
        io.to('admins').emit('inquiry:updated', { inquiry: inquiry.toObject ? inquiry.toObject() : inquiry });
      }
    } catch (err) {
      console.warn('Socket emit failed', err.message);
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/inquiries/:id/mark-unavailable
// @desc    Mark date unavailable (Organizer only)
// @access  Private
export const markDateUnavailable = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required',
      });
    }

    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }

    const venue = await Venue.findById(inquiry.venue);

    // Check authorization
    if (venue.organizer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this venue',
      });
    }

    // Add unavailable date range
    venue.unavailableDates = venue.unavailableDates || [];
    venue.unavailableDates.push({
      start: new Date(startDate),
      end: new Date(endDate),
    });

    await venue.save();

    res.status(200).json({
      success: true,
      message: 'Dates marked as unavailable',
      venue,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/inquiries/:id
// @desc    Delete inquiry (Customer or Admin only)
// @access  Private
export const deleteInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }

    // Check authorization - only customer who created it or admin
    if (inquiry.customer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this inquiry' });
    }

    await Inquiry.findByIdAndDelete(req.params.id);

    // Remove from user's inquiries
    await User.findByIdAndUpdate(inquiry.customer, {
      $pull: { inquiries: inquiry._id },
    });

    res.status(200).json({
      success: true,
      message: 'Inquiry deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
