import Booking from '../models/Booking.js';
import Inquiry from '../models/Inquiry.js';
import Venue from '../models/Venue.js';

export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.status(200).json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getBookingICS = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).send('Booking not found');

    const start = new Date(booking.eventDate).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDate = new Date(new Date(booking.eventDate).getTime() + (4 * 60 * 60 * 1000));
    const end = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//WedVenue//Booking//EN\nBEGIN:VEVENT\nUID:booking-${booking.id}\nDTSTAMP:${start}\nDTSTART:${start}\nDTEND:${end}\nSUMMARY:Booking - ${booking.venueName}\nDESCRIPTION:Guests: ${booking.guestCount}\\nCustomer: ${booking.customerName}\nEND:VEVENT\nEND:VCALENDAR`;

    res.setHeader('Content-Type', 'text/calendar');
    res.setHeader('Content-Disposition', `attachment; filename="booking-${booking.id}.ics"`);
    res.send(ics);
  } catch (err) {
    res.status(500).send(err.message);
  }
};
