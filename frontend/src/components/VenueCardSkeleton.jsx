import React from 'react';

export default function VenueCardSkeleton() {
  return (
    <div className="h-full overflow-hidden rounded-2xl border border-[var(--border-light)] bg-white dark:bg-[#211C1F] shadow-sm flex flex-col justify-between select-none">
      {/* Image Skeleton */}
      <div className="relative h-52 w-full animate-pulse bg-stone-200 dark:bg-stone-800/40 shrink-0">
        {/* Category badge placeholder */}
        <div className="absolute left-3 top-3 h-5 w-14 rounded-lg bg-stone-300 dark:bg-stone-700/60" />
        {/* Rating badge placeholder */}
        <div className="absolute right-3 top-3 h-7 w-12 rounded-lg bg-stone-300 dark:bg-stone-700/60" />
      </div>

      {/* Content Skeleton */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div className="flex-grow flex flex-col justify-start space-y-3">
          {/* Title */}
          <div className="h-6 w-3/4 animate-pulse rounded bg-stone-200 dark:bg-stone-800/40" />

          {/* Location & Space Preference */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-grow">
              <div className="h-4 w-4 animate-pulse rounded bg-stone-200 dark:bg-stone-800/40 shrink-0" />
              <div className="h-4 w-1/3 animate-pulse rounded bg-stone-200 dark:bg-stone-800/40" />
            </div>
            <div className="h-5 w-24 animate-pulse rounded bg-stone-200 dark:bg-stone-800/40 shrink-0" />
          </div>

          {/* Capacity */}
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-pulse rounded bg-stone-200 dark:bg-stone-800/40 shrink-0" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-stone-200 dark:bg-stone-800/40" />
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-1 mt-1">
            <div className="h-4 w-3 animate-pulse rounded bg-stone-200 dark:bg-stone-800/40" />
            <div className="h-6 w-24 animate-pulse rounded bg-stone-200 dark:bg-stone-800/40" />
            <div className="h-3.5 w-12 animate-pulse rounded bg-stone-200 dark:bg-stone-800/40 ml-1" />
          </div>

          {/* Amenities */}
          <div className="flex flex-wrap gap-2 pt-1">
            <div className="h-6 w-16 animate-pulse rounded-lg bg-stone-200 dark:bg-stone-800/40" />
            <div className="h-6 w-20 animate-pulse rounded-lg bg-stone-200 dark:bg-stone-800/40" />
            <div className="h-6 w-14 animate-pulse rounded-lg bg-stone-200 dark:bg-stone-800/40" />
          </div>
        </div>

        {/* Actions Button row */}
        <div className="flex gap-2 mt-4 shrink-0">
          <div className="h-[38px] flex-1 animate-pulse rounded-lg bg-stone-200 dark:bg-stone-800/40" />
          <div className="h-[38px] w-[38px] animate-pulse rounded-lg bg-stone-200 dark:bg-stone-800/40 shrink-0" />
          <div className="h-[38px] w-[38px] animate-pulse rounded-lg bg-stone-200 dark:bg-stone-800/40 shrink-0" />
        </div>
      </div>
    </div>
  );
}
