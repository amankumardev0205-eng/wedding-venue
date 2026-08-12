import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { createInquiryStart, createInquirySuccess, createInquiryFailure } from '../redux/inquirySlice';
import { inquiryAPI, venueAPI } from '../utils/api';
import { getVenueCardImageUrl, handleImageError } from '../utils/imageUtils';
import AvailabilityCalendar from '../components/AvailabilityCalendar';

const inquirySchema = z.object({
  eventDate: z.string().min(1, 'Event date is required'),
  guestCount: z.string().min(1, 'Guest count is required').refine((val) => parseInt(val) > 0, 'Must be a positive number'),
  eventType: z.enum(['wedding', 'engagement', 'reception', 'other'], {
    errorMap: () => ({ message: 'Please select an event type' }),
  }),
  message: z.string().optional(),
});

export default function SendInquiry() {
  const { venueId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { isLoading, error } = useSelector((state) => state.inquiries);
  const [venue, setVenue] = useState(null);
  const [venueLoading, setVenueLoading] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(inquirySchema),
  });

  const eventDate = watch('eventDate');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchVenue();
  }, [venueId, user]);

  const fetchVenue = async () => {
    try {
      const response = await venueAPI.getVenueById(venueId);
      setVenue(response.data.venue);
    } catch (error) {
      console.error('Error fetching venue:', error);
    } finally {
      setVenueLoading(false);
    }
  };

  const onSubmit = async (data) => {
    dispatch(createInquiryStart());
    try {
      const payload = {
        venueId,
        eventDate: data.eventDate,
        guestCount: parseInt(data.guestCount),
        eventType: data.eventType,
        message: data.message || '',
      };
      const response = await inquiryAPI.createInquiry(payload);
      dispatch(createInquirySuccess(response.data.inquiry));
      alert('Inquiry sent successfully!');
      navigate('/my-inquiries');
    } catch (err) {
      dispatch(createInquiryFailure(err.response?.data?.message || 'Failed to send inquiry'));
    }
  };

  if (!user) return null;

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(`/venues/${venueId}`)}
          className="text-blue-600 hover:underline mb-6"
        >
          ← Back to Venue
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h1 className="text-3xl font-bold mb-2">Send Inquiry</h1>
              <p className="text-gray-600 mb-6">
                Fill out the form below to send an inquiry to the venue organizer.
              </p>

              {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Event Date */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Event Date *</label>
                  <input type="hidden" {...register('eventDate')} />
                  <AvailabilityCalendar
                    unavailableDates={venue?.unavailableDates || []}
                    selectedDate={eventDate}
                    onDateSelect={(dateStr) => setValue('eventDate', dateStr, { shouldValidate: true })}
                  />
                  {errors.eventDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.eventDate.message}</p>
                  )}
                </div>

                {/* Guest Count */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Number of Guests *</label>
                  <input
                    type="number"
                    placeholder="Enter guest count"
                    {...register('guestCount')}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.guestCount && (
                    <p className="text-red-500 text-sm mt-1">{errors.guestCount.message}</p>
                  )}
                </div>

                {/* Event Type */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Event Type *</label>
                  <select
                    {...register('eventType')}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select event type</option>
                    <option value="wedding">Wedding</option>
                    <option value="engagement">Engagement</option>
                    <option value="reception">Reception</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.eventType && (
                    <p className="text-red-500 text-sm mt-1">{errors.eventType.message}</p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Message</label>
                  <textarea
                    placeholder="Any additional details or requests for the organizer..."
                    {...register('message')}
                    rows="5"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
                >
                  {isLoading ? 'Sending Inquiry...' : 'Send Inquiry'}
                </button>
              </form>
            </div>
          </div>

          {/* Venue Summary */}
          {venueLoading && (
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-md sticky top-4 space-y-4">
                <div className="h-6 w-1/2 animate-pulse rounded bg-stone-200 dark:bg-stone-800/40" />
                <div className="h-40 w-full animate-pulse rounded bg-stone-200 dark:bg-stone-800/40" />
                <div className="h-5 w-3/4 animate-pulse rounded bg-stone-200 dark:bg-stone-800/40" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-stone-200 dark:bg-stone-800/40" />
              </div>
            </div>
          )}

          {!venueLoading && venue && (
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-md sticky top-4">
                <h3 className="text-xl font-bold mb-4">Venue Summary</h3>
                <div className="mb-4">
                  {venue.images && venue.images.length > 0 && (
                    <img
                      src={getVenueCardImageUrl(venue.images[0].url)}
                      alt={venue.name}
                      className="w-full h-40 object-cover rounded mb-4"
                      loading="lazy"
                      onError={handleImageError}
                    />
                  )}
                </div>
                <p className="font-semibold mb-2">{venue.name}</p>
                <p className="text-gray-600 text-sm mb-3">
                  Capacity: {venue.capacity.min} - {venue.capacity.max} guests
                </p>
                {venue.pricing.perPlate ? (
                  <p className="text-blue-600 font-semibold">
                    ${venue.pricing.perPlate} per plate
                  </p>
                ) : (
                  <p className="text-blue-600 font-semibold">
                    ${venue.pricing.flatRate} flat rate
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
