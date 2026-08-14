import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Heart, MapPin, Star, Users, Wifi, VolumeX, ParkingCircle, ArrowLeft, Building2, Calendar, ShieldCheck, Mail } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import ReviewDisplay from '../components/ReviewDisplay';
import AvailabilityCalendar from '../components/AvailabilityCalendar';
import VenueMap from '../components/VenueMap';
import {
  getVenueByIdFailure,
  getVenueByIdStart,
  getVenueByIdSuccess,
} from '../redux/venueSlice';
import { getReviewsFailure, getReviewsStart, getReviewsSuccess, resetReviews } from '../redux/reviewSlice';
import {
  addFavoriteFailure,
  addFavoriteStart,
  addFavoriteSuccess,
  removeFavoriteFailure,
  removeFavoriteStart,
  removeFavoriteSuccess,
} from '../redux/favoritesSlice';
import { favoritesAPI, reviewAPI, venueAPI } from '../utils/api';
import { getVenueDetailImageUrl, handleImageError } from '../utils/imageUtils';

// UI components
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const amenityIcons = {
  wifi: Wifi,
  parking: ParkingCircle,
  ac: VolumeX,
};

export default function VenueDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedVenue: venue, isLoading, error } = useSelector((state) => state.venues);
  const { user } = useSelector((state) => state.auth || {});
  const { favorites } = useSelector((state) => state.favorites || { favorites: [] });
  const { reviews, currentPage, totalPages, total } = useSelector((state) => state.reviews || { reviews: [], currentPage: 1, totalPages: 1, total: 0 });
  const [isFavoriting, setIsFavoriting] = useState(false);
  const [reviewPage, setReviewPage] = useState(1);

  const isFavorited = favorites.some((fav) => fav._id === id);

  useEffect(() => {
    fetchVenueDetails();
    fetchReviews(1);
    return () => dispatch(resetReviews());
  }, [id]);

  const fetchVenueDetails = async () => {
    dispatch(getVenueByIdStart());
    try {
      const response = await venueAPI.getVenueById(id);
      dispatch(getVenueByIdSuccess(response.data.venue));
    } catch (err) {
      dispatch(getVenueByIdFailure(err.response?.data?.message || 'Failed to fetch venue'));
    }
  };

  const fetchReviews = async (page = 1) => {
    dispatch(getReviewsStart());
    try {
      const response = await reviewAPI.getVenueReviews(id, { page, limit: 10 });
      dispatch(getReviewsSuccess(response.data));
      setReviewPage(page);
    } catch (err) {
      dispatch(getReviewsFailure(err.response?.data?.message || 'Failed to fetch reviews'));
    }
  };

  const handleReviewDeleted = () => {
    const isLastItemOnPage = reviews.length === 1 && reviewPage > 1;
    const nextPage = isLastItemOnPage ? reviewPage - 1 : reviewPage;
    fetchReviews(nextPage);
  };

  const handleSendInquiry = () => {
    navigate(user ? `/inquiry/${id}` : '/login');
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setIsFavoriting(true);
    try {
      if (isFavorited) {
        dispatch(removeFavoriteStart());
        await favoritesAPI.removeFavorite(id);
        dispatch(removeFavoriteSuccess(id));
      } else {
        dispatch(addFavoriteStart());
        await favoritesAPI.addFavorite(id);
        dispatch(addFavoriteSuccess(venue));
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update favorites';
      isFavorited ? dispatch(removeFavoriteFailure(message)) : dispatch(addFavoriteFailure(message));
    } finally {
      setIsFavoriting(false);
    }
  };

  // Loading skeleton matching final page structure
  if (isLoading) {
    return (
      <div className="min-h-screen text-[var(--text-body)] pt-8 pb-16 bg-[var(--bg-slate)]">
        <div className="mx-auto max-w-6xl px-6">
          <div className="h-9 w-36 animate-pulse rounded-xl bg-stone-200 dark:bg-stone-800/40 mb-6" />

          <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
            <div className="xl:col-span-2 space-y-6">
              {/* Image Swiper Placeholder */}
              <div className="h-[28rem] w-full animate-pulse rounded-2xl bg-stone-200 dark:bg-stone-800/40" />

              {/* Title and details skeleton */}
              <div className="bg-white dark:bg-[#1A1618] border border-[var(--border-medium)] rounded-2xl p-6 space-y-4 shadow-sm">
                <div className="h-4.5 w-16 animate-pulse rounded-lg bg-stone-200 dark:bg-stone-800/40" />
                <div className="h-8 w-2/3 animate-pulse rounded-lg bg-stone-200 dark:bg-stone-800/40" />
                <div className="h-5 w-1/3 animate-pulse rounded-lg bg-stone-200 dark:bg-stone-800/40" />
              </div>
            </div>

            {/* Sidebar Inquiry skeleton */}
            <div className="xl:col-span-1 space-y-6">
              <div className="bg-white dark:bg-[#1A1618] border border-[var(--border-medium)] rounded-2xl p-6 space-y-6 shadow-sm">
                <div className="h-6 w-1/2 animate-pulse rounded-lg bg-stone-200 dark:bg-stone-800/40" />
                <div className="space-y-3">
                  <div className="h-14 w-full animate-pulse rounded-xl bg-stone-200 dark:bg-stone-800/40" />
                  <div className="h-11 w-full animate-pulse rounded-xl bg-stone-200 dark:bg-stone-800/40" />
                  <div className="h-11 w-full animate-pulse rounded-xl bg-stone-200 dark:bg-stone-800/40" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !venue) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-20 flex justify-center items-center">
        <ErrorState 
          title="Venue not found"
          message={error || 'The requested venue information could not be retrieved.'}
          onRetry={fetchVenueDetails}
        />
      </div>
    );
  }

  const rating = Number(venue.rating || 0);
  const images = venue.images || [];
  const amenities = venue.amenities || [];
  const minCapacity = venue.capacity?.min ?? 0;
  const maxCapacity = venue.capacity?.max ?? 0;
  const price = venue.pricing?.perPlate || venue.pricing?.flatRate || 0;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 bg-[var(--bg-slate)] transition-colors duration-300">
      
      {/* Back button */}
      <div className="flex select-none">
        <Button 
          onClick={() => navigate('/venues')} 
          variant="ghost" 
          size="sm" 
          className="mb-6 px-3 py-1.5 text-primary hover:bg-primary/5 gap-1.5 font-bold"
          leftIcon={<ArrowLeft size={15} />}
        >
          Back to venues
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        {/* Left main content column */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          
          {/* Swiper Image Gallery */}
          <div className="overflow-hidden rounded-2xl border border-[var(--border-medium)] bg-stone-100 dark:bg-stone-900/50 shadow-sm relative shrink-0">
            {images.length > 0 ? (
              <Swiper 
                modules={[Navigation, Pagination]} 
                spaceBetween={10} 
                slidesPerView={1} 
                navigation 
                pagination={{ clickable: true }} 
                className="h-[28rem] w-full"
              >
                {images.map((image, index) => (
                  <SwiperSlide key={image.url || index}>
                    <img 
                      src={getVenueDetailImageUrl(image.url)} 
                      alt={`${venue.name} - image ${index + 1}`} 
                      className="h-full w-full object-cover" 
                      loading="lazy" 
                      onError={handleImageError} 
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <div className="flex h-[28rem] items-center justify-center text-[var(--text-muted)] text-sm font-semibold select-none">
                No images available
              </div>
            )}
          </div>

          {/* Heading Detail Info Card */}
          <Card>
            <CardContent className="p-6 md:p-8 flex flex-col gap-5">
              <div className="flex flex-wrap items-start justify-between gap-5 border-b border-[var(--border-light)] pb-4">
                <div className="flex flex-col gap-1.5">
                  <Badge variant="primary" className="bg-primary/5 text-primary border-primary/15 py-0 px-2.5 w-fit select-none">
                    {venue.venueType || 'Venue'}
                  </Badge>
                  <h1 className="font-display font-extrabold text-3xl md:text-4xl text-[var(--text-dark)] leading-tight mt-1">
                    {venue.name}
                  </h1>
                </div>
                {/* Rating badge */}
                <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3.5 py-1.5 text-amber-600 dark:text-amber-500 font-bold text-sm shadow-sm select-none border border-amber-500/15 shrink-0">
                  <Star className="fill-amber-500 stroke-amber-500" size={15} />
                  <span>{rating.toFixed(1)} Rating</span>
                </div>
              </div>

              {/* Sub-details (location & capacity) */}
              <div className="flex flex-wrap gap-5 text-sm font-semibold text-[var(--text-muted)] select-none">
                <span className="inline-flex items-center gap-2 capitalize text-[var(--text-dark)]">
                  <MapPin size={16} className="text-primary shrink-0" />
                  <span>{venue.city || 'Location unavailable'}</span>
                </span>
                <span className="inline-flex items-center gap-2">
                  <Users size={16} className="text-primary shrink-0" />
                  <span>Capacity: {minCapacity} - {maxCapacity} guests</span>
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Description Section */}
          <Card>
            <CardContent className="p-6 md:p-8 flex flex-col gap-3">
              <h2 className="font-serif text-xl font-bold text-[var(--text-dark)] select-none">
                About this venue
              </h2>
              <div className="h-px bg-[var(--border-light)] w-full mb-1" />
              <p className="text-sm leading-relaxed text-[var(--text-body)] select-text">
                {venue.description || 'No description has been added yet.'}
              </p>
            </CardContent>
          </Card>

          {/* Stats Key Info Cards Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 select-none">
            <Card>
              <CardContent className="p-5 flex flex-col gap-1">
                <span className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wider">Venue Type</span>
                <span className="text-base font-bold capitalize text-[var(--text-dark)]">
                  {venue.venueType || 'N/A'}
                </span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 flex flex-col gap-1">
                <span className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wider">Guest Capacity</span>
                <span className="text-base font-bold text-[var(--text-dark)]">
                  {minCapacity} - {maxCapacity} guests
                </span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 flex flex-col gap-1">
                <span className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wider">Setting Type</span>
                <span className="text-base font-bold text-[var(--text-dark)]">
                  {venue.indoor && venue.outdoor ? 'Indoor & Outdoor' : venue.indoor ? 'Indoor' : 'Outdoor'}
                </span>
              </CardContent>
            </Card>
          </div>

          {/* Amenities Badge List */}
          <Card>
            <CardContent className="p-6 md:p-8 flex flex-col gap-4">
              <h2 className="font-serif text-xl font-bold text-[var(--text-dark)] select-none">
                Available Amenities
              </h2>
              <div className="h-px bg-[var(--border-light)] w-full" />
              <div className="flex flex-wrap gap-2.5 mt-1 select-none">
                {amenities.length ? amenities.map((amenity) => {
                  const Icon = amenityIcons[amenity];
                  return (
                    <Badge 
                      key={amenity} 
                      variant="primary" 
                      className="bg-primary/5 text-primary border-primary/10 text-xs py-1 px-3.5 capitalize tracking-normal font-semibold flex items-center gap-1.5"
                    >
                      {Icon && <Icon size={14} className="shrink-0 text-primary" />}
                      <span>{amenity.replace(/_/g, ' ')}</span>
                    </Badge>
                  );
                }) : (
                  <span className="text-xs text-[var(--text-muted)] font-semibold">No amenities listed.</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Final CTA Inquiry Banner */}
          <Card className="bg-primary/5 dark:bg-[#1A1618]/30 border border-primary/15 overflow-hidden select-none">
            <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex flex-col gap-1 text-left">
                <h3 className="font-serif text-lg md:text-xl font-bold text-[var(--text-dark)] leading-tight">
                  Interested in {venue.name}?
                </h3>
                <p className="text-xs md:text-sm text-[var(--text-muted)] font-semibold leading-normal">
                  Send an inquiry to the coordinator to learn more about dates, availability, and package pricing options.
                </p>
              </div>
              <Button 
                variant="primary" 
                size="lg" 
                onClick={handleSendInquiry} 
                className="shrink-0 shadow-sm w-full md:w-auto"
              >
                Send Inquiry
              </Button>
            </CardContent>
          </Card>

          {/* Reviews Block Container */}
          <div className="mt-4 border-t border-[var(--border-light)] pt-8">
            <ReviewDisplay
              reviews={reviews}
              venueId={id}
              currentPage={currentPage}
              totalPages={totalPages}
              total={total}
              onPageChange={fetchReviews}
              onReviewDeleted={handleReviewDeleted}
            />
          </div>
        </div>

        {/* Right sidebar column */}
        <aside className="xl:col-span-1 flex flex-col gap-6">
          <div className="sticky top-24 flex flex-col gap-6">
            
            {/* Pricing & Primary Actions Card */}
            <Card>
              <CardContent className="p-6 md:p-8 flex flex-col gap-5 select-none">
                <div>
                  <h2 className="font-serif text-lg font-bold text-[var(--text-dark)] mb-3">
                    Plan your next step
                  </h2>
                  <div className="rounded-2xl bg-primary/5 dark:bg-[#1A1618]/80 border border-primary/10 p-5 flex flex-col gap-0.5">
                    <span className="text-xs text-primary font-bold uppercase tracking-wider">
                      {venue.pricing?.perPlate ? 'Starting per plate' : 'Starting flat rate'}
                    </span>
                    <span className="text-3xl font-extrabold text-primary tracking-tight mt-1">
                      ₹{price.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Organizer details */}
                {venue.organizer && (
                  <div className="flex flex-col gap-1 border-t border-[var(--border-light)] pt-4 mt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Coordinator Contact</span>
                    <span className="font-bold text-sm text-[var(--text-dark)] flex items-center gap-1.5 mt-1">
                      <ShieldCheck size={14} className="text-primary shrink-0" />
                      <span>{venue.organizer.name}</span>
                    </span>
                    <span className="text-xs text-[var(--text-muted)] font-semibold flex items-center gap-1.5">
                      <Mail size={13} className="shrink-0" />
                      <span>{venue.organizer.email}</span>
                    </span>
                  </div>
                )}

                {/* Action button triggers */}
                <div className="flex flex-col gap-2 mt-2 w-full">
                  <Button 
                    onClick={handleSendInquiry} 
                    variant="primary"
                    className="w-full font-bold"
                  >
                    Send inquiry
                  </Button>
                  <Button 
                    onClick={handleToggleFavorite} 
                    disabled={isFavoriting} 
                    variant="outline"
                    className={`w-full font-bold gap-2 ${
                      isFavorited 
                        ? 'bg-red-50 dark:bg-red-950/20 text-red-600 border-red-200 dark:border-red-900/40 hover:bg-red-100 dark:hover:bg-red-900/20' 
                        : 'border-stone-200 dark:border-stone-850'
                    }`}
                    leftIcon={<Heart size={16} className={isFavorited ? 'fill-red-600 text-red-600' : 'text-stone-500'} />}
                  >
                    {isFavorited ? 'Remove favorite' : 'Save favorite'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Availability Calendar Card */}
            <Card>
              <CardContent className="p-6">
                <h2 className="font-serif text-base font-bold text-[var(--text-dark)] mb-4 flex items-center gap-2 select-none">
                  <Calendar size={16} className="text-primary shrink-0" />
                  <span>Availability Calendar</span>
                </h2>
                <AvailabilityCalendar unavailableDates={venue.unavailableDates || []} />
              </CardContent>
            </Card>

            {/* Location & Interactive Map Card */}
            <Card>
              <CardContent className="p-6 flex flex-col gap-4">
                <h2 className="font-serif text-base font-bold text-[var(--text-dark)] select-none">
                  Location details
                </h2>
                <div className="flex items-start gap-2 text-xs font-semibold text-[var(--text-body)] select-text mb-1">
                  <MapPin size={14} className="text-primary shrink-0 mt-0.5" />
                  <span>{venue.address || 'Address unavailable'}</span>
                </div>
                
                {venue.coordinates && (
                  <div className="w-full h-[220px] rounded-xl overflow-hidden border border-stone-250/50 dark:border-stone-800/40 shadow-inner select-none z-10">
                    <VenueMap 
                      venues={[venue]} 
                      center={venue.coordinates} 
                      zoom={14} 
                      singleVenueMode={true} 
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </aside>
      </div>
    </div>
  );
}
