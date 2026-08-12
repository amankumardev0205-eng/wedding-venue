import React, { useState } from 'react';
import { Heart, MapPin, Users, Star } from 'lucide-react';
import { handleImageError } from '../utils/imageUtils';

export default function StaticVenueCard({ venue }) {
  const [isFavorited, setIsFavorited] = useState(false);

  return (
    <div className="group overflow-hidden rounded-2xl clay-card transition-all duration-300 hover:-translate-y-1.5 flex flex-col h-full">
      {/* Venue Image */}
      <div className="relative aspect-[3/2] w-full overflow-hidden shrink-0 bg-rose-50/10">
        <img
          src={venue.image}
          alt={venue.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
          loading="lazy"
          onError={handleImageError}
        />
        
        {/* Favorite heart icon top-right */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorited(!isFavorited);
          }}
          className="absolute right-3.5 top-3.5 h-9 w-9 rounded-full bg-white/70 dark:bg-black/40 backdrop-blur-md border border-white/40 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-white hover:scale-105 active:scale-95 transition-all shadow-sm z-10"
        >
          <Heart
            size={16}
            className={`transition-colors ${
              isFavorited
                ? 'fill-[#E85D83] text-[#E85D83] dark:fill-[#F06D91] dark:text-[#F06D91]'
                : 'text-slate-700 dark:text-white'
            }`}
          />
        </button>
      </div>

      {/* Info Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start gap-2 mb-1.5">
            <h3 className="font-extrabold text-base text-[var(--text-dark)] leading-snug truncate">
              {venue.name}
            </h3>
            <div className="flex items-center gap-1 shrink-0 text-amber-500 font-bold text-xs bg-amber-500/10 px-2 py-0.5 rounded-full">
              <Star size={12} className="fill-amber-500" />
              <span>{venue.rating}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-semibold mb-2">
            <MapPin size={13} className="text-[#E85D83] dark:text-[#F06D91]" />
            <span className="capitalize">{venue.city}</span>
          </div>

          <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-4 line-clamp-2">
            {venue.shortDescription}
          </p>
        </div>

        <div className="pt-3 border-t border-[var(--border-light)] flex justify-between items-center text-xs shrink-0">
          <div className="flex items-center gap-1.5 text-[var(--text-muted)] font-semibold">
            <Users size={14} className="text-[var(--text-muted)]" />
            <span>Up to {venue.capacity}</span>
          </div>
          <div className="font-extrabold text-[var(--text-dark)] text-sm">
            {venue.price}
          </div>
        </div>
      </div>
    </div>
  );
}
