import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Users, Calendar } from 'lucide-react';

import { createInquiryStart, createInquirySuccess, createInquiryFailure } from '../redux/inquirySlice';
import { inquiryAPI, venueAPI } from '../utils/api';
import { getVenueCardImageUrl, handleImageError } from '../utils/imageUtils';
import AvailabilityCalendar from '../components/AvailabilityCalendar';

// UI components
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { Card, CardContent } from '../components/ui/Card';

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
  const { user } = useSelector((state) => state.auth || {});
  const { isLoading, error } = useSelector((state) => state.inquiries || { isLoading: false, error: null });
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
    <div className="min-h-screen text-[var(--text-body)] pt-8 pb-16 bg-[var(--bg-slate)] transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-6">
        
        {/* Back Link */}
        <div className="flex select-none">
          <Button 
            onClick={() => navigate(`/venues/${venueId}`)} 
            variant="ghost" 
            size="sm" 
            className="mb-6 px-3 py-1.5 text-primary hover:bg-primary/5 gap-1.5 font-bold"
            leftIcon={<ArrowLeft size={15} />}
          >
            Back to Venue
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Submission Form Grid */}
          <div className="lg:col-span-2">
            <Card className="border border-[var(--border-medium)] shadow-sm">
              <CardContent className="p-6 md:p-8 flex flex-col gap-6">
                
                <div className="border-b border-[var(--border-light)] pb-4 select-none">
                  <h1 className="font-serif text-2xl font-bold text-[var(--text-dark)] mb-1.5">Send Inquiry</h1>
                  <p className="text-xs text-[var(--text-muted)] font-semibold">
                    Fill out the form below to coordinate date bookings with the venue coordinator.
                  </p>
                </div>

                {error && (
                  <div className="p-3.5 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/10 text-xs font-semibold text-red-750 select-text">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  
                  {/* Event Date Calendar selector */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-[var(--text-dark)] flex items-center gap-1.5 select-none">
                      <Calendar size={14} className="text-primary" />
                      <span>Select Event Date *</span>
                    </label>
                    <input type="hidden" {...register('eventDate')} />
                    <div className="max-w-md w-full">
                      <AvailabilityCalendar
                        unavailableDates={venue?.unavailableDates || []}
                        selectedDate={eventDate}
                        onDateSelect={(dateStr) => setValue('eventDate', dateStr, { shouldValidate: true })}
                      />
                    </div>
                    {errors.eventDate && (
                      <p className="text-xs font-semibold text-red-500 mt-1 select-none">{errors.eventDate.message}</p>
                    )}
                  </div>

                  {/* Guest Count */}
                  <Input
                    label="Number of Guests *"
                    type="number"
                    placeholder="Enter guest count"
                    error={errors.guestCount?.message}
                    leftIcon={<Users size={14} className="text-[var(--text-muted)]" />}
                    {...register('guestCount')}
                  />

                  {/* Event Type Select list */}
                  <Select
                    label="Event Type *"
                    error={errors.eventType?.message}
                    {...register('eventType')}
                  >
                    <option value="">Select event type</option>
                    <option value="wedding">Wedding</option>
                    <option value="engagement">Engagement</option>
                    <option value="reception">Reception</option>
                    <option value="other">Other</option>
                  </Select>

                  {/* Message details */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] select-none">
                      Additional Message details
                    </label>
                    <textarea
                      placeholder="Any additional queries, menu requirements, or notes for the coordinator..."
                      {...register('message')}
                      rows="4"
                      className="w-full text-sm bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-stone-300 dark:hover:border-stone-800 transition duration-150 text-[var(--text-body)]"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isLoading}
                    className="w-full py-3.5 font-bold shadow-sm select-none"
                  >
                    {isLoading ? 'Sending Inquiry...' : 'Send Inquiry'}
                  </Button>

                </form>

              </CardContent>
            </Card>
          </div>

          {/* Sticky Right Column: Venue Summary */}
          <div className="lg:col-span-1 lg:sticky lg:top-24 select-none shrink-0 w-full">
            
            {venueLoading && (
              <Card className="border border-[var(--border-medium)] animate-pulse">
                <CardContent className="p-6 space-y-4">
                  <div className="h-5 w-1/2 rounded bg-stone-200 dark:bg-stone-850" />
                  <div className="h-40 w-full rounded bg-stone-200 dark:bg-stone-850" />
                  <div className="h-5 w-3/4 rounded bg-stone-200 dark:bg-stone-850" />
                  <div className="h-4 w-1/2 rounded bg-stone-200 dark:bg-stone-850" />
                </CardContent>
              </Card>
            )}

            {!venueLoading && venue && (
              <Card className="border border-[var(--border-medium)] shadow-sm">
                <CardContent className="p-6 flex flex-col gap-4">
                  
                  <h3 className="font-serif text-lg font-bold text-[var(--text-dark)] border-b border-[var(--border-light)] pb-2.5">
                    Venue Summary
                  </h3>
                  
                  {venue.images && venue.images.length > 0 && (
                    <div className="w-full h-40 overflow-hidden rounded-xl bg-stone-100 border border-[var(--border-light)] relative">
                      <img
                        src={getVenueCardImageUrl(venue.images[0].url)}
                        alt={venue.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={handleImageError}
                      />
                    </div>
                  )}
                  
                  <div className="flex flex-col gap-1 mt-1">
                    <p className="font-serif font-bold text-base text-[var(--text-dark)] leading-snug">
                      {venue.name}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] font-semibold flex items-center gap-1.5 mt-1">
                      <Users size={13} className="text-primary shrink-0" />
                      <span>Capacity: {venue.capacity?.min} - {venue.capacity?.max} guests</span>
                    </p>
                  </div>

                  <div className="rounded-xl bg-primary/5 dark:bg-stone-900 border border-primary/10 p-3.5 flex flex-col gap-0.5 mt-2">
                    <span className="text-[10px] text-primary font-bold uppercase tracking-wider">
                      {venue.pricing?.perPlate ? 'Price per plate' : 'Flat rate price'}
                    </span>
                    <span className="text-xl font-extrabold text-primary tracking-tight mt-0.5">
                      ₹{(venue.pricing?.perPlate || venue.pricing?.flatRate || 0).toLocaleString('en-IN')}
                    </span>
                  </div>

                </CardContent>
              </Card>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
