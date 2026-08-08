import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Heart, MapPin, Star, Users, Wifi, VolumeX, ParkingCircle, ArrowLeft } from 'lucide-react';
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
  const { user } = useSelector((state) => state.auth);
  const { favorites } = useSelector((state) => state.favorites);
  const { reviews, currentPage, totalPages, total } = useSelector((state) => state.reviews);
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

  if (isLoading) {
    return (
      <div className="min-h-screen text-[var(--text-body)] pt-6">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Back button skeleton */}
          <div className="h-6 w-32 animate-pulse rounded bg-stone-200 dark:bg-stone-800/40 mb-6" />

          <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
            <div className="xl:col-span-2 space-y-6">
              {/* Image Swiper Placeholder */}
              <div className="h-[28rem] w-full animate-pulse rounded-2xl bg-stone-200 dark:bg-stone-800/40" />

              {/* Title and details skeleton */}
              <div className="clay-card p-6 space-y-4">
                <div className="h-4 w-16 animate-pulse rounded bg-stone-200 dark:bg-stone-800/40" />
                <div className="h-9 w-2/3 animate-pulse rounded bg-stone-200 dark:bg-stone-800/40" />
                <div className="h-5 w-1/3 animate-pulse rounded bg-stone-200 dark:bg-stone-800/40" />
              </div>
            </div>

            {/* Sidebar Inquiry skeleton */}
            <div className="xl:col-span-1">
              <div className="clay-card p-6 space-y-6">
                <div className="h-6 w-1/2 animate-pulse rounded bg-stone-200 dark:bg-stone-800/40" />
                <div className="space-y-3">
                  <div className="h-10 w-full animate-pulse rounded bg-stone-200 dark:bg-stone-800/40" />
                  <div className="h-10 w-full animate-pulse rounded bg-stone-200 dark:bg-stone-800/40" />
                  <div className="h-12 w-full animate-pulse rounded bg-stone-300 dark:bg-stone-700/60" />
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
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="mx-auto max-w-xl p-8 text-center clay-card">
          <p className="mb-4 text-lg text-red-600">{error || 'Venue not found'}</p>
          <button onClick={() => navigate('/venues')} className="rounded-lg bg-[#352c32] px-6 py-3 font-semibold text-white clay-button">
            Back to venues
          </button>
        </div>
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <button onClick={() => navigate('/venues')} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#cf5577]">
        <ArrowLeft size={17} />
        Back to venues
      </button>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <div className="overflow-hidden clay-card">
            {images.length > 0 ? (
              <Swiper modules={[Navigation, Pagination]} spaceBetween={10} slidesPerView={1} navigation pagination={{ clickable: true }} className="h-[28rem] w-full bg-[#f7ded6]">
                {images.map((image, index) => (
                  <SwiperSlide key={image.url || index}>
                    <img src={getVenueDetailImageUrl(image.url)} alt={`${venue.name} - ${index + 1}`} className="h-full w-full object-cover" loading="lazy" onError={handleImageError} />
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <div className="flex h-[28rem] items-center justify-center text-[var(--text-muted)]">No images available</div>
            )}
          </div>

          <div className="mt-8 clay-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#cf5577]">{venue.venueType || 'Venue'}</p>
                <h1 className="mt-2 text-3xl font-extrabold text-[var(--text-dark)] md:text-4xl">{venue.name}</h1>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-[#fff3c6] px-4 py-2 text-[var(--text-dark)]">
                <Star className="fill-yellow-400 text-yellow-500" size={19} />
                <span className="font-bold">{rating.toFixed(1)}</span>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-4 text-[var(--text-muted)]">
              <span className="inline-flex items-center gap-2 capitalize"><MapPin size={18} />{venue.city || 'Location unavailable'}</span>
              <span className="inline-flex items-center gap-2"><Users size={18} />{minCapacity} - {maxCapacity} guests</span>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-bold text-[var(--text-dark)]">About this venue</h2>
              <p className="mt-3 leading-7 text-[var(--text-body)]">{venue.description || 'No description has been added yet.'}</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="clay-card p-5">
              <p className="text-sm text-[var(--text-muted)]">Venue Type</p>
              <p className="mt-1 text-lg font-bold capitalize text-[var(--text-dark)]">{venue.venueType || 'N/A'}</p>
            </div>
            <div className="clay-card p-5">
              <p className="text-sm text-[var(--text-muted)]">Capacity</p>
              <p className="mt-1 text-lg font-bold text-[var(--text-dark)]">{minCapacity} - {maxCapacity}</p>
            </div>
            <div className="clay-card p-5">
              <p className="text-sm text-[var(--text-muted)]">Setting</p>
              <p className="mt-1 text-lg font-bold text-[var(--text-dark)]">{venue.indoor && venue.outdoor ? 'Indoor & Outdoor' : venue.indoor ? 'Indoor' : 'Outdoor'}</p>
            </div>
          </div>

          <div className="mt-6 clay-card p-6">
            <h2 className="text-xl font-bold text-[var(--text-dark)]">Amenities</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {amenities.length ? amenities.map((amenity) => {
                const Icon = amenityIcons[amenity];
                return (
                  <span key={amenity} className="inline-flex items-center gap-2 rounded-lg bg-[#ffd8c7] px-4 py-2 text-sm font-semibold capitalize text-[#9f3f61]">
                    {Icon && <Icon size={16} />}
                    {amenity.replace(/_/g, ' ')}
                  </span>
                );
              }) : <span className="text-[var(--text-muted)]">No amenities listed.</span>}
            </div>
          </div>

          <div className="mt-8 border-t border-white/70 pt-8">
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

        <aside className="xl:col-span-1">
          <div className="sticky top-24 space-y-6">
            <div className="clay-card p-6">
              <h2 className="text-lg font-bold text-[var(--text-dark)]">Plan your next step</h2>
              <div className="mt-4 rounded-lg bg-[#ffd8c7] p-4">
                <p className="text-sm text-[#9f3f61]">{venue.pricing?.perPlate ? 'Starting per plate' : 'Starting price'}</p>
                <p className="mt-1 text-3xl font-extrabold text-[var(--text-dark)]">₹{price}</p>
              </div>

              {venue.organizer && (
                <div className="mt-5">
                  <p className="font-semibold text-[var(--text-dark)]">{venue.organizer.name}</p>
                  <p className="text-sm text-[var(--text-muted)]">{venue.organizer.email}</p>
                </div>
              )}

              <button onClick={handleSendInquiry} className="mt-5 w-full rounded-lg bg-[#e86f8f] py-3 font-semibold text-white clay-button">
                Send inquiry
              </button>
              <button onClick={handleToggleFavorite} disabled={isFavoriting} className={`mt-3 flex w-full items-center justify-center gap-2 rounded-lg py-3 font-semibold clay-button ${isFavorited ? 'bg-red-100 text-red-600' : 'bg-white/75 text-[#cf5577]'}`}>
                <Heart size={18} fill={isFavorited ? 'currentColor' : 'none'} />
                {isFavorited ? 'Remove favorite' : 'Save favorite'}
              </button>
            </div>

            <div className="clay-card p-6">
              <h2 className="text-lg font-bold text-[var(--text-dark)] mb-4">Availability</h2>
              <AvailabilityCalendar unavailableDates={venue.unavailableDates || []} />
            </div>

            <div className="clay-card p-6">
              <h2 className="text-lg font-bold text-[var(--text-dark)]">Location</h2>
              <p className="mt-3 text-[var(--text-body)]">{venue.address || 'Address unavailable'}</p>
              {venue.coordinates && (
                <div className="mt-4 w-full h-[220px] rounded-lg overflow-hidden border border-[var(--border-light)] shadow-inner">
                  <VenueMap venues={[venue]} center={venue.coordinates} zoom={14} singleVenueMode={true} />
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
