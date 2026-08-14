import React, { useState } from 'react';
import { Heart, MapPin, Users, Star } from 'lucide-react';
import { handleImageError } from '../utils/imageUtils';

export default function StaticVenueCard({ venue }) {
  const [isFavorited, setIsFavorited] = useState(false);

  return (
    <div className="group overflow-hidden rounded-2xl border border-[var(--border-medium)] bg-white dark:bg-[#1A1618] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
      {/* Venue Image */}
      <div className="relative aspect-[3/2] w-full overflow-hidden shrink-0 bg-stone-100 dark:bg-stone-900/50">
        <img
          src={venue.image}
          alt={venue.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={handleImageError}
        />
        
        {/* Favorite heart icon top-right */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorited(!isFavorited);
          }}
          aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
          className="absolute right-3.5 top-3.5 h-9 w-9 rounded-full bg-white/95 dark:bg-stone-900/95 backdrop-blur-sm border border-stone-200/50 dark:border-white/10 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:scale-105 hover:text-primary active:scale-95 transition-all shadow-sm z-10"
        >
          <Heart
            size={16}
            className={`transition-colors ${
              isFavorited
                ? 'fill-primary text-primary'
                : 'text-stone-600 dark:text-stone-300'
            }`}
          />
        </button>
      </div>

      {/* Info Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start gap-3 mb-2">
            <h3 className="font-serif font-bold text-lg text-[var(--text-dark)] leading-tight group-hover:text-primary transition-colors line-clamp-1">
              {venue.name}
            </h3>
            <div className="flex items-center gap-1 shrink-0 text-amber-600 dark:text-amber-500 font-bold text-xs bg-amber-500/10 px-2 py-0.5 rounded-full select-none">
              <Star size={11} className="fill-amber-500 stroke-amber-500" />
              <span>{venue.rating}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-semibold mb-3">
            <MapPin size={13} className="text-primary shrink-0" />
            <span className="capitalize">{venue.city}</span>
          </div>

          <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-4 line-clamp-2">
            {venue.shortDescription}
          </p>
        </div>

        <div className="pt-4 border-t border-[var(--border-light)] flex justify-between items-center text-xs shrink-0 mt-auto">
          <div className="flex items-center gap-1.5 text-[var(--text-muted)] font-semibold">
            <Users size={14} className="text-[var(--text-muted)] shrink-0" />
            <span>Up to {venue.capacity} guests</span>
          </div>
          <div className="font-bold text-primary text-sm">
            {venue.price}
          </div>
        </div>
      </div>
    </div>
  );
}
