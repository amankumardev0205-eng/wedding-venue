import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import { FaStar, FaMapMarkerAlt, FaUsers, FaHeart, FaBalanceScale } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { addFavoriteStart, addFavoriteSuccess, addFavoriteFailure, removeFavoriteStart, removeFavoriteSuccess, removeFavoriteFailure } from '../redux/favoritesSlice';
import { addToCompare, removeFromCompare } from '../redux/compareSlice';
import { favoritesAPI } from '../utils/api';
import { getSrcSet, getVenueCardImageUrl, handleImageError } from '../utils/imageUtils';

export default function VenueCard({ venue }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { favorites } = useSelector((state) => state.favorites);
  const { selectedVenues, maxCompare } = useSelector((state) => state.compare);
  const [isFavoriting, setIsFavoriting] = useState(false);

  const isFavorited = favorites.some((fav) => fav._id === venue._id);
  const isInCompare = selectedVenues.some((v) => v._id === venue._id);
  const canAddToCompare = selectedVenues.length < maxCompare && !isInCompare;
  const rating = Number(venue.rating || 0);
  const minCapacity = venue.capacity?.min ?? 0;
  const maxCapacity = venue.capacity?.max ?? 0;
  const amenities = venue.amenities || [];
  const price = venue.pricing?.perPlate || venue.pricing?.flatRate || 0;

  const handleAddToFavorites = async (e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }

    setIsFavoriting(true);
    if (isFavorited) {
      // Remove from favorites
      dispatch(removeFavoriteStart());
      try {
        await favoritesAPI.removeFavorite(venue._id);
        dispatch(removeFavoriteSuccess(venue._id));
      } catch (error) {
        dispatch(removeFavoriteFailure(error.response?.data?.message || 'Failed to remove from favorites'));
      }
    } else {
      // Add to favorites
      dispatch(addFavoriteStart());
      try {
        await favoritesAPI.addFavorite(venue._id);
        dispatch(addFavoriteSuccess(venue));
      } catch (error) {
        dispatch(addFavoriteFailure(error.response?.data?.message || 'Failed to add to favorites'));
      }
    }
    setIsFavoriting(false);
  };

  const handleViewDetails = () => {
    navigate(`/venues/${venue._id}`);
  };

  const handleToggleCompare = (e) => {
    e.stopPropagation();
    if (isInCompare) {
      dispatch(removeFromCompare(venue._id));
    } else if (canAddToCompare) {
      dispatch(addToCompare(venue));
    }
  };

  return (
    <motion.div
      onClick={handleViewDetails}
      className="group h-full cursor-pointer overflow-hidden clay-card transition-transform flex flex-col"
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      {/* Venue Image */}
      <div className="relative h-52 w-full bg-[#f7ded6] overflow-hidden">
        {venue.images && venue.images.length > 0 ? (
          <picture>
            <source type="image/webp" srcSet={getSrcSet(venue.images[0].url)} />
            <img
              src={getVenueCardImageUrl(venue.images[0].url)}
              srcSet={getSrcSet(venue.images[0].url)}
              sizes="(max-width: 640px) 100vw, 33vw"
              alt={venue.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              decoding="async"
              onError={handleImageError}
            />
          </picture>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[var(--text-muted)]">
            No image available
          </div>
        )}
        
        {/* Venue Type Badge */}
        <div className="absolute left-3 top-3 rounded-lg bg-[#352c32]/85 backdrop-blur-sm px-2.5 py-1 shadow text-white text-[10px] font-bold uppercase tracking-wider select-none z-[5]">
          {venue.venueType || venue.type || 'Venue'}
        </div>

        {/* Rating Badge */}
        <div className="absolute right-3 top-3 rounded-lg bg-white/90 px-3 py-1 shadow z-[5]">
          <div className="flex items-center gap-1">
            <FaStar className="text-yellow-400" size={14} />
            <span className="text-sm font-semibold text-[var(--text-dark)]">{rating.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div className="flex-grow flex flex-col justify-start">
          <h3 className="mb-2 truncate text-lg font-bold text-[var(--text-dark)] transition-colors group-hover:text-[#cf5577]" title={venue.name}>
            {venue.name}
          </h3>

          {/* Location & Space Preference */}
          <div className="mb-3 flex items-center justify-between gap-2 text-sm text-[var(--text-muted)]">
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-[#e86f8f]" size={14} />
              <span className="capitalize font-semibold text-[var(--text-dark)]">{venue.city}</span>
            </div>
            <span className="inline-flex items-center rounded-md bg-[#ffd8c7]/40 dark:bg-white/5 px-2 py-0.5 text-[10px] font-bold text-[#9f3f61] dark:text-[#f6a7b8] select-none">
              {venue.indoor && venue.outdoor ? 'Indoor & Outdoor' : venue.indoor ? 'Indoor' : venue.outdoor ? 'Outdoor' : 'Venue'}
            </span>
          </div>

          {/* Capacity */}
          <div className="mb-3 flex items-center gap-2 text-sm text-[var(--text-muted)]">
            <FaUsers className="text-[#e86f8f]" size={14} />
            <span>
              <span className="font-semibold text-[var(--text-dark)]">{minCapacity} - {maxCapacity}</span> guests
            </span>
          </div>

          {/* Pricing */}
          <div className="mb-4 flex items-baseline gap-1">
            <span className="text-xs font-extrabold text-[#cf5577]">₹</span>
            <span className="text-xl font-extrabold text-[#cf5577] tracking-tight">
              {price.toLocaleString('en-IN')}
            </span>
            <span className="text-xs font-semibold text-[var(--text-muted)] lowercase ml-0.5 select-none">
              {venue.pricing?.perPlate ? 'per plate' : 'flat rate'}
            </span>
          </div>

          {/* Amenities */}
          <div className="flex flex-wrap gap-2 mb-4">
            {amenities.slice(0, 3).map((amenity) => (
              <span
                key={amenity}
                className="rounded-lg bg-[#ffd8c7]/30 dark:bg-[#ffd8c7]/10 px-2 py-1 text-xs capitalize text-[#9f3f61] dark:text-[#f6a7b8] font-semibold"
              >
                {amenity.replace(/_/g, ' ')}
              </span>
            ))}
            {amenities.length > 3 && (
              <span className="text-xs text-[var(--text-muted)] font-medium">+{amenities.length - 3} more</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4 shrink-0">
          <button
            onClick={handleViewDetails}
            className="flex-1 rounded-lg bg-[#352c32] py-2 px-2.5 text-xs md:text-sm font-semibold text-white clay-button whitespace-nowrap truncate text-center min-h-[38px]"
            title="View Details"
          >
            View Details
          </button>
          <button
            onClick={handleAddToFavorites}
            disabled={isFavoriting}
            className={`rounded-lg px-2.5 py-2 transition clay-button shrink-0 flex items-center justify-center min-w-[38px] min-h-[38px] ${
              isFavorited
                ? 'bg-red-100 text-red-600'
                : 'bg-white/75 text-[#cf5577]'
            }`}
            title="Add to favorites"
          >
            <FaHeart size={16} fill={isFavorited ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={handleToggleCompare}
            disabled={!canAddToCompare && !isInCompare}
            className={`rounded-lg px-2.5 py-2 transition clay-button shrink-0 flex items-center justify-center min-w-[38px] min-h-[38px] ${
              isInCompare
                ? 'bg-[#d9cdfb] text-[#5c4a91]'
                : canAddToCompare
                ? 'bg-white/75 text-[#5c4a91]'
                : 'cursor-not-allowed bg-white/40 text-gray-300'
            }`}
            title={canAddToCompare ? 'Add to compare' : isInCompare ? 'Remove from compare' : 'Max 4 venues'}
          >
            <FaBalanceScale size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
