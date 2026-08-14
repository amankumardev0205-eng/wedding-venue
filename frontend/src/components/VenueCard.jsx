import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import { Star, MapPin, Users, Heart, Scale } from 'lucide-react';
import { motion } from 'framer-motion';
import { addFavoriteStart, addFavoriteSuccess, addFavoriteFailure, removeFavoriteStart, removeFavoriteSuccess, removeFavoriteFailure } from '../redux/favoritesSlice';
import { addToCompare, removeFromCompare } from '../redux/compareSlice';
import { favoritesAPI } from '../utils/api';
import { getSrcSet, getVenueCardImageUrl, handleImageError } from '../utils/imageUtils';
import Button from './ui/Button';
import Badge from './ui/Badge';

export default function VenueCard({ venue }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth || {});
  const { favorites } = useSelector((state) => state.favorites || { favorites: [] });
  const { selectedVenues, maxCompare } = useSelector((state) => state.compare || { selectedVenues: [], maxCompare: 4 });
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
      className="group h-full cursor-pointer overflow-hidden rounded-2xl border border-[var(--border-medium)] bg-white dark:bg-[#1A1618] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {/* Venue Image */}
      <div className="relative h-52 w-full bg-stone-100 dark:bg-stone-900/50 overflow-hidden shrink-0">
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
          <div className="flex h-full w-full items-center justify-center text-[var(--text-muted)] text-sm font-semibold select-none">
            No image available
          </div>
        )}
        
        {/* Venue Type Badge */}
        <Badge 
          variant="neutral" 
          className="absolute left-3.5 top-3.5 bg-stone-900/80 text-white border-stone-900/40 backdrop-blur-sm text-[10px] uppercase font-bold py-1 select-none z-10"
        >
          {venue.venueType || venue.type || 'Venue'}
        </Badge>

        {/* Rating Badge */}
        <div className="absolute right-3.5 top-3.5 rounded-full bg-white/95 dark:bg-stone-900/95 backdrop-blur-sm border border-stone-200/50 dark:border-white/10 px-3 py-1 shadow-sm select-none z-10 flex items-center gap-1">
          <Star className="text-amber-500 fill-amber-500" size={12} />
          <span className="text-xs font-bold text-[var(--text-dark)]">{rating.toFixed(1)}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="flex-grow flex flex-col justify-start">
          <h3 className="mb-2 font-serif text-lg font-bold text-[var(--text-dark)] transition-colors duration-200 group-hover:text-primary leading-snug truncate" title={venue.name}>
            {venue.name}
          </h3>

          {/* Location & Space Preference */}
          <div className="mb-3 flex items-center justify-between gap-3 text-xs text-[var(--text-muted)] font-semibold select-none">
            <div className="flex items-center gap-1.5 min-w-0">
              <MapPin className="text-primary shrink-0" size={13} />
              <span className="capitalize text-[var(--text-dark)] truncate">{venue.city}</span>
            </div>
            <Badge variant="primary" className="bg-primary/5 text-primary border-primary/10 text-[10px] tracking-normal shrink-0">
              {venue.indoor && venue.outdoor ? 'Indoor & Outdoor' : venue.indoor ? 'Indoor' : venue.outdoor ? 'Outdoor' : 'Venue'}
            </Badge>
          </div>

          {/* Capacity */}
          <div className="mb-3 flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-medium select-none">
            <Users className="text-primary shrink-0" size={13} />
            <span>
              Capacity: <span className="font-semibold text-[var(--text-dark)]">{minCapacity} - {maxCapacity}</span> guests
            </span>
          </div>

          {/* Pricing */}
          <div className="mb-4 flex items-baseline gap-1 select-none">
            <span className="text-xs font-bold text-primary">₹</span>
            <span className="text-xl font-extrabold text-primary tracking-tight">
              {price.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-[var(--text-muted)] font-medium ml-1 lowercase">
              {venue.pricing?.perPlate ? 'per plate' : 'flat rate'}
            </span>
          </div>

          {/* Amenities */}
          <div className="flex flex-wrap gap-1.5 mb-4 select-none">
            {amenities.slice(0, 3).map((amenity) => (
              <Badge 
                key={amenity} 
                variant="secondary" 
                className="capitalize text-[10px] tracking-normal py-0.5"
              >
                {amenity.replace(/_/g, ' ')}
              </Badge>
            ))}
            {amenities.length > 3 && (
              <span className="text-[10px] text-[var(--text-muted)] font-semibold flex items-center">
                +{amenities.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4 shrink-0 select-none">
          <Button
            onClick={handleViewDetails}
            variant="primary"
            className="flex-1 text-xs md:text-sm py-2 px-3 min-h-[38px] font-bold"
            title="View Details"
          >
            View Details
          </Button>
          
          {/* Favorite heart action */}
          <button
            onClick={handleAddToFavorites}
            disabled={isFavoriting}
            className={`rounded-xl px-3 py-2 transition-all duration-200 shrink-0 flex items-center justify-center border min-w-[38px] min-h-[38px] outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              isFavorited
                ? 'bg-red-50 dark:bg-red-950/20 text-red-600 border-red-200 dark:border-red-900/40 shadow-sm'
                : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-850 hover:bg-stone-50 dark:hover:bg-stone-800'
            }`}
            title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart size={15} className={`transition-colors ${isFavorited ? 'fill-red-600 text-red-600' : 'text-stone-600 dark:text-stone-300'}`} />
          </button>

          {/* Compare scale action */}
          <button
            onClick={handleToggleCompare}
            disabled={!canAddToCompare && !isInCompare}
            className={`rounded-xl px-3 py-2 transition-all duration-200 shrink-0 flex items-center justify-center border min-w-[38px] min-h-[38px] outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              isInCompare
                ? 'bg-primary/10 text-primary border-primary/20 shadow-sm'
                : canAddToCompare
                ? 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-850 hover:bg-stone-50 dark:hover:bg-stone-800'
                : 'cursor-not-allowed bg-stone-100 dark:bg-stone-800/40 text-stone-300 dark:text-stone-700 border-stone-200/50 dark:border-stone-800/40'
            }`}
            title={isInCompare ? 'Remove from compare' : canAddToCompare ? 'Add to compare' : `Max ${maxCompare} venues`}
            aria-label={isInCompare ? 'Remove from compare' : canAddToCompare ? 'Add to compare' : `Max ${maxCompare} venues`}
          >
            <Scale size={15} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
