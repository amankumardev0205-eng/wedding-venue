import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Grid2X2,
  IndianRupee,
  List,
  Map,
  MapPin,
  Search,
  SlidersHorizontal,
  Star,
  Users,
  Navigation,
  Check,
  ChevronDown
} from 'lucide-react';
import VenueCard from '../components/VenueCard';
import VenueCardSkeleton from '../components/VenueCardSkeleton';
import VenueMap from '../components/VenueMap';
import {
  clearFilters,
  getVenuesFailure,
  getVenuesStart,
  getVenuesSuccess,
  setFilter,
  setPage,
} from '../redux/venueSlice';
import { venueAPI } from '../utils/api';

const locationData = {
  rajasthan: ['jaipur', 'udaipur', 'jodhpur'],
  goa: ['south goa', 'north goa'],
  maharashtra: ['mumbai', 'pune'],
  'delhi ncr': ['new delhi', 'gurugram'],
  karnataka: ['bengaluru']
};

const presetLocations = [
  { name: 'Rambagh Area, Jaipur, Rajasthan', lat: '26.8979', lng: '75.8080' },
  { name: 'Lake Pichola, Udaipur, Rajasthan', lat: '24.5756', lng: '73.6800' },
  { name: 'Colaba Waterfront, Mumbai, Maharashtra', lat: '18.9220', lng: '72.8333' },
  { name: 'Cavelossim Beach Resort, Goa', lat: '15.1748', lng: '73.9317' },
  { name: 'Chanakyapuri Palace Zone, New Delhi', lat: '28.5790', lng: '77.1950' },
  { name: 'Palace Grounds, Bengaluru, Karnataka', lat: '13.0035', lng: '77.5891' }
];

const amenities = ['parking', 'pool', 'catering', 'stage', 'sound', 'ac'];

export default function Venues() {
  const dispatch = useDispatch();
  const { venues, isLoading, error, filters, pagination } = useSelector((state) => state.venues);
  const [searchParams, setSearchParams] = useSearchParams();

  const [localSearch, setLocalSearch] = useState(filters.search || '');

  const [showFilters, setShowFilters] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  const [hoveredVenueId, setHoveredVenueId] = useState(null);
  const [mobileView, setMobileView] = useState('list'); // 'list' or 'map'

  const activeFilterCount = (() => {
    let count = 0;
    if (filters.state) count++;
    if (filters.city) count++;
    if (filters.search) count++;
    if (filters.venueType) count++;
    if (filters.minPrice) count++;
    if (filters.maxPrice) count++;
    if (filters.minCapacity) count++;
    if (filters.maxCapacity) count++;
    if (filters.minRating) count++;
    if (filters.indoor === 'true') count++;
    if (filters.outdoor === 'true') count++;
    if (filters.amenities?.length) count += filters.amenities.length;
    if (filters.lat && filters.lng) count++;
    return count;
  })();

  const activeTags = (() => {
    const tags = [];
    if (filters.state) {
      tags.push({
        id: 'state',
        label: `State: ${filters.state}`,
        onRemove: () => dispatch(setFilter({ state: '', city: '' }))
      });
    }
    if (filters.city) {
      tags.push({
        id: 'city',
        label: `City: ${filters.city}`,
        onRemove: () => dispatch(setFilter({ city: '' }))
      });
    }
    if (filters.search) {
      tags.push({
        id: 'search',
        label: `Search: ${filters.search}`,
        onRemove: () => {
          setLocalSearch('');
          dispatch(setFilter({ search: '' }));
        }
      });
    }
    if (filters.venueType) {
      tags.push({
        id: 'venueType',
        label: `Type: ${filters.venueType}`,
        onRemove: () => dispatch(setFilter({ venueType: '' }))
      });
    }
    if (filters.minPrice || filters.maxPrice) {
      let label = 'Price: ';
      if (filters.minPrice && filters.maxPrice) {
        label += `₹${filters.minPrice} - ₹${filters.maxPrice}`;
      } else if (filters.minPrice) {
        label += `≥ ₹${filters.minPrice}`;
      } else {
        label += `≤ ₹${filters.maxPrice}`;
      }
      tags.push({
        id: 'price',
        label,
        onRemove: () => dispatch(setFilter({ minPrice: '', maxPrice: '' }))
      });
    }
    if (filters.minCapacity || filters.maxCapacity) {
      let label = 'Capacity: ';
      if (filters.minCapacity && filters.maxCapacity) {
        label += `${filters.minCapacity} - ${filters.maxCapacity} guests`;
      } else if (filters.minCapacity) {
        label += `≥ ${filters.minCapacity} guests`;
      } else {
        label += `≤ ${filters.maxCapacity} guests`;
      }
      tags.push({
        id: 'capacity',
        label,
        onRemove: () => dispatch(setFilter({ minCapacity: '', maxCapacity: '' }))
      });
    }
    if (filters.minRating) {
      tags.push({
        id: 'minRating',
        label: `Rating: ${filters.minRating}+ ★`,
        onRemove: () => dispatch(setFilter({ minRating: '' }))
      });
    }
    if (filters.indoor === 'true') {
      tags.push({
        id: 'indoor',
        label: 'Space: Indoor',
        onRemove: () => dispatch(setFilter({ indoor: '' }))
      });
    }
    if (filters.outdoor === 'true') {
      tags.push({
        id: 'outdoor',
        label: 'Space: Outdoor',
        onRemove: () => dispatch(setFilter({ outdoor: '' }))
      });
    }
    if (filters.amenities && filters.amenities.length > 0) {
      filters.amenities.forEach((amenity) => {
        tags.push({
          id: `amenity-${amenity}`,
          label: amenity,
          onRemove: () => {
            const current = filters.amenities || [];
            dispatch(setFilter({
              amenities: current.filter((item) => item !== amenity)
            }));
          }
        });
      });
    }
    if (filters.lat && filters.lng) {
      tags.push({
        id: 'coordinates',
        label: 'Location: Radius Search',
        onRemove: () => dispatch(setFilter({ lat: '', lng: '', radiusKm: '' }))
      });
    }
    return tags;
  })();



  useEffect(() => {
    const nextFilters = {};
    const city = searchParams.get('city');
    const guests = searchParams.get('guests') || searchParams.get('minCapacity');
    const search = searchParams.get('search');
    const state = searchParams.get('state');
    const venueType = searchParams.get('venueType');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const maxCapacity = searchParams.get('maxCapacity');
    const minRating = searchParams.get('minRating');
    const amenitiesParam = searchParams.get('amenities');
    const indoor = searchParams.get('indoor');
    const outdoor = searchParams.get('outdoor');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radiusKm = searchParams.get('radiusKm');
    const sortParam = searchParams.get('sort');
    const pageParam = searchParams.get('page');

    if (city) nextFilters.city = city;
    if (guests) nextFilters.minCapacity = guests;
    if (search) {
      nextFilters.search = search;
      setLocalSearch(search);
    }
    if (state) nextFilters.state = state;
    if (venueType) nextFilters.venueType = venueType;
    if (minPrice) nextFilters.minPrice = minPrice;
    if (maxPrice) nextFilters.maxPrice = maxPrice;
    if (maxCapacity) nextFilters.maxCapacity = maxCapacity;
    if (minRating) nextFilters.minRating = minRating;
    if (amenitiesParam) {
      nextFilters.amenities = amenitiesParam.split(',').map(a => a.trim().toLowerCase());
    }
    if (indoor) nextFilters.indoor = indoor;
    if (outdoor) nextFilters.outdoor = outdoor;
    if (lat) nextFilters.lat = lat;
    if (lng) nextFilters.lng = lng;
    if (radiusKm) nextFilters.radiusKm = radiusKm;
    if (sortParam) nextFilters.sort = sortParam;

    if (pageParam) {
      dispatch(setPage(parseInt(pageParam, 10) || 1));
    }
    if (Object.keys(nextFilters).length) dispatch(setFilter(nextFilters));
  }, []);

  // Sync localSearch state when filters.search changes (e.g. on clear all)
  useEffect(() => {
    setLocalSearch(filters.search || '');
  }, [filters.search]);

  // Debounce search filter dispatching
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== (filters.search || '')) {
        dispatch(setFilter({ search: localSearch }));
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [localSearch, dispatch, filters.search]);

  // Sync URL search parameters with Redux filters and pagination page
  useEffect(() => {
    const nextParams = new URLSearchParams();
    if (filters.state) nextParams.set('state', filters.state);
    if (filters.city) nextParams.set('city', filters.city);
    if (filters.search) nextParams.set('search', filters.search);
    if (filters.venueType) nextParams.set('venueType', filters.venueType);
    if (filters.minPrice) nextParams.set('minPrice', filters.minPrice);
    if (filters.maxPrice) nextParams.set('maxPrice', filters.maxPrice);
    if (filters.minCapacity) nextParams.set('minCapacity', filters.minCapacity);
    if (filters.maxCapacity) nextParams.set('maxCapacity', filters.maxCapacity);
    if (filters.minRating) nextParams.set('minRating', filters.minRating);
    if (filters.amenities?.length) nextParams.set('amenities', filters.amenities.join(','));
    if (filters.indoor) nextParams.set('indoor', filters.indoor);
    if (filters.outdoor) nextParams.set('outdoor', filters.outdoor);
    if (filters.lat) nextParams.set('lat', filters.lat);
    if (filters.lng) nextParams.set('lng', filters.lng);
    if (filters.radiusKm) nextParams.set('radiusKm', filters.radiusKm);
    if (filters.sort) nextParams.set('sort', filters.sort);
    if (pagination.page > 1) nextParams.set('page', pagination.page);

    setSearchParams(nextParams, { replace: true });
  }, [filters, pagination.page, setSearchParams]);

  useEffect(() => {
    fetchVenues();
  }, [filters, pagination.page]);

  const fetchVenues = async () => {
    dispatch(getVenuesStart());
    try {
      const params = {};
      if (filters.state) params.state = filters.state;
      if (filters.city) params.city = filters.city;
      if (filters.search) params.search = filters.search;
      if (filters.venueType) params.venueType = filters.venueType;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.minCapacity) params.minCapacity = filters.minCapacity;
      if (filters.maxCapacity) params.maxCapacity = filters.maxCapacity;
      if (filters.amenities?.length) params.amenities = filters.amenities.join(',');
      if (filters.minRating) params.minRating = filters.minRating;
      if (filters.indoor) params.indoor = filters.indoor;
      if (filters.outdoor) params.outdoor = filters.outdoor;
      if (filters.lat && filters.lng) {
        params.lat = filters.lat;
        params.lng = filters.lng;
        params.radiusKm = filters.radiusKm || 15;
      }
      params.page = pagination.page;
      params.limit = pagination.limit;

      const response = await venueAPI.getVenues(params);
      dispatch(getVenuesSuccess(response.data));
    } catch (err) {
      dispatch(getVenuesFailure(err.response?.data?.message || 'Failed to fetch venues'));
    }
  };

  const handleFilterChange = (key, value) => {
    dispatch(setFilter({ [key]: value }));
  };

  const toggleAmenity = (amenity) => {
    const current = filters.amenities || [];
    handleFilterChange(
      'amenities',
      current.includes(amenity) ? current.filter((item) => item !== amenity) : [...current, amenity],
    );
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  const handleApplyFilters = () => {
    if (localSearch !== (filters.search || '')) {
      dispatch(setFilter({ search: localSearch }));
    } else {
      fetchVenues();
    }
  };

  const handleStateChange = (stateValue) => {
    dispatch(setFilter({ state: stateValue, city: '' }));
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        dispatch(setFilter({
          lat: position.coords.latitude.toFixed(6),
          lng: position.coords.longitude.toFixed(6),
          radiusKm: filters.radiusKm || 15
        }));
      },
      (error) => {
        alert(`Failed to get location: ${error.message}`);
      }
    );
  };

  const handleMapClick = (latlng) => {
    dispatch(setFilter({
      lat: latlng.lat.toFixed(6),
      lng: latlng.lng.toFixed(6),
      radiusKm: filters.radiusKm || 15
    }));
  };

  const fieldClass = 'mt-1.5 flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-[#E5E7EB] dark:border-white/10 bg-[#F9FAFB] dark:bg-[#211C1F] focus-within:border-[#E85D83] dark:focus-within:border-[#F06D91] focus-within:ring-1 focus-within:ring-[#E85D83]/20 dark:focus-within:ring-[#F06D91]/20 transition-all shadow-sm h-10 w-full relative';
  const inputClass = 'w-full bg-transparent text-sm text-[#292524] dark:text-[#FFF7F5] outline-none placeholder-[#756B70] dark:placeholder-[#C8BCC0]';
  const labelClass = 'text-xs font-bold tracking-wider uppercase text-[#292524] dark:text-[#FFF7F5]';

  const citiesForSelectedState = filters.state
    ? locationData[filters.state] || []
    : Object.values(locationData).flat();

  const handleLocationSelect = (index) => {
    if (index === '') {
      dispatch(setFilter({ lat: '', lng: '' }));
      return;
    }
    const loc = presetLocations[Number(index)];
    dispatch(setFilter({ lat: loc.lat, lng: loc.lng }));
  };

  const activeLocationIndex = presetLocations.findIndex(
    (loc) => Number(loc.lat).toFixed(3) === Number(filters.lat || 0).toFixed(3)
  );

  const hasCustomCoords = filters.lat && filters.lng && activeLocationIndex === -1;

  const resultText = (() => {
    if (isLoading) {
      return 'Finding venues...';
    }
    const total = pagination.total || 0;
    return `${total} ${total === 1 ? 'venue' : 'venues'} found`;
  })();

  return (
    <div className="min-h-screen text-[var(--text-body)] pt-6">
      <section className="relative overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-4 pb-4 pt-12 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#E85D83] dark:text-[#F06D91]">Venue discovery</p>
            <h1 className="mt-3 text-4xl font-extrabold leading-tight text-[#1C1917] dark:text-[#FFF7F5] md:text-5xl">
              Find the right venue without the planning clutter
            </h1>
            <p className="mt-3 text-base text-[#57534E] dark:text-[#C8BCC0]">
              Search, filter, shortlist, compare, and send inquiries from one clean flow.
            </p>
          </div>

          <div className="mt-6 bg-white dark:bg-[#211C1F] border border-[#E5E7EB] dark:border-white/10 rounded-2xl shadow-md shadow-stone-200/50 dark:shadow-none overflow-hidden">
            {/* Header row / toggle bar inside panel */}
            <div className="flex items-center justify-between border-b border-[var(--border-light)] bg-stone-50/40 dark:bg-stone-900/10">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                aria-expanded={showFilters}
                className="flex-1 flex items-center justify-between gap-5 p-4 md:px-6 md:py-4 hover:bg-[#FFFDFB] dark:hover:bg-[#262024] transition text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#E85D83]/20"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 shadow-sm shrink-0">
                    <SlidersHorizontal className="text-[#E85D83] dark:text-[#F06D91]" size={20} />
                  </div>
                  <div>
                    <h2 className="text-base md:text-lg font-bold text-[var(--text-dark)] flex flex-wrap items-center gap-2">
                      <span>Filter Options</span>
                      {activeFilterCount > 0 && (
                        <span className="inline-flex items-center justify-center bg-[#E11D48] dark:bg-[#F06D91] text-white text-[10px] md:text-xs font-bold px-2.5 py-0.5 rounded-full shrink-0 shadow-sm">
                          {activeFilterCount} Active
                        </span>
                      )}
                      <span className="inline-flex items-center justify-center text-[10px] md:text-xs font-bold text-[#E85D83] dark:text-[#F06D91] bg-rose-500/10 dark:bg-rose-500/20 px-2.5 py-0.5 rounded-md shrink-0 select-none shadow-sm">
                        {resultText}
                      </span>
                    </h2>
                    <p className="text-xs text-[#756B70] dark:text-[#C8BCC0] mt-0.5">
                      {showFilters ? 'Click to collapse filters' : 'Click to expand filters'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-extrabold text-[#E85D83] dark:text-[#F06D91] uppercase tracking-wider hidden sm:inline">
                    {showFilters ? 'Collapse' : 'Expand'}
                  </span>
                  <motion.div
                    animate={{ rotate: showFilters ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="text-[#756B70] dark:text-[#C8BCC0]" size={20} />
                  </motion.div>
                </div>
              </button>
              
              <div className="pr-4 md:pr-6 shrink-0 flex items-center">
                <button 
                  type="button"
                  onClick={handleClearFilters} 
                  className="rounded-xl border border-[var(--border-light)] hover:bg-[#FFF8F3] dark:hover:bg-[#2A2327] px-4 py-2 text-xs font-bold text-[#E85D83] dark:text-[#F06D91] transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  Clear all
                </button>
              </div>
            </div>

            {/* Active filter summary row */}
            {activeTags.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto py-2.5 px-4 md:px-6 border-b border-[var(--border-light)] bg-stone-50/20 dark:bg-stone-900/5 max-w-full scrollbar-none select-none">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#756B70] dark:text-[#C8BCC0] shrink-0 mr-1">
                  Active:
                </span>
                <div className="flex items-center gap-2 max-w-full">
                  <AnimatePresence>
                    {activeTags.map((tag) => (
                      <motion.div
                        key={tag.id}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="inline-flex items-center gap-1 bg-stone-100 dark:bg-[#2C2428] border border-stone-200 dark:border-white/5 rounded-full pl-3 pr-1.5 py-0.5 text-xs text-[#292524] dark:text-[#FFF7F5] shrink-0 shadow-sm"
                      >
                        <span className="truncate max-w-[150px] font-medium capitalize">{tag.label}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            tag.onRemove();
                          }}
                          className="h-5 w-5 rounded-full flex items-center justify-center text-[#756B70] dark:text-[#C8BCC0] hover:bg-stone-200 dark:hover:bg-white/10 hover:text-[#E11D48] dark:hover:text-[#F06D91] transition cursor-pointer"
                          aria-label={`Remove filter: ${tag.label}`}
                        >
                          <svg className="h-3 w-3 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            <AnimatePresence initial={false}>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="p-5 md:p-6">

            {/* Filter grid groups */}
            <div className="space-y-6">
              {/* PRIMARY FILTERS GROUP */}
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#C43C62] dark:text-[#F06D91] mb-3">Primary Filters</h3>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className={labelClass}>State</label>
                    <div className={fieldClass}>
                      <MapPin className="text-[#E85D83] dark:text-[#F06D91] shrink-0" size={16} />
                      <div className="relative w-full flex items-center">
                        <select value={filters.state || ''} onChange={(e) => handleStateChange(e.target.value)} className="w-full bg-transparent text-sm text-[#292326] dark:text-[#FFF7F5] outline-none pr-6 appearance-none cursor-pointer">
                          <option value="">All States</option>
                          <option value="rajasthan">Rajasthan</option>
                          <option value="goa">Goa</option>
                          <option value="maharashtra">Maharashtra</option>
                          <option value="delhi ncr">Delhi NCR</option>
                          <option value="karnataka">Karnataka</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-0 text-[#756B70] dark:text-[#C8BCC0] pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>City</label>
                    <div className={fieldClass}>
                      <MapPin className="text-[#E85D83] dark:text-[#F06D91] shrink-0" size={16} />
                      <div className="relative w-full flex items-center">
                        <select value={filters.city || ''} onChange={(e) => handleFilterChange('city', e.target.value)} className="w-full bg-transparent text-sm text-[#292326] dark:text-[#FFF7F5] outline-none pr-6 appearance-none cursor-pointer">
                          <option value="">All Cities</option>
                          {citiesForSelectedState.map((city) => (
                            <option key={city} value={city} className="capitalize">{city}</option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-0 text-[#756B70] dark:text-[#C8BCC0] pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Search</label>
                    <div className={fieldClass}>
                      <Search className="text-[#E85D83] dark:text-[#F06D91] shrink-0" size={16} />
                      <input type="text" placeholder="Venue name..." value={localSearch} onChange={(e) => setLocalSearch(e.target.value)} className={inputClass} />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Venue Type</label>
                    <div className={fieldClass}>
                      <Building2 className="text-[#E85D83] dark:text-[#F06D91] shrink-0" size={16} />
                      <div className="relative w-full flex items-center">
                        <select value={filters.venueType || ''} onChange={(e) => handleFilterChange('venueType', e.target.value)} className="w-full bg-transparent text-sm text-[#292326] dark:text-[#FFF7F5] outline-none pr-6 appearance-none cursor-pointer">
                          <option value="">All Types</option>
                          <option value="banquet">Banquet</option>
                          <option value="resort">Resort</option>
                          <option value="lawn">Lawn</option>
                          <option value="hotel">Hotel</option>
                          <option value="club">Club</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-0 text-[#756B70] dark:text-[#C8BCC0] pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SPLIT GROUP: REQUIREMENTS & NEARBY SEARCH */}
              <div className="grid gap-6 grid-cols-1 lg:grid-cols-12 border-t border-[var(--border-light)] pt-5">
                {/* VENUE REQUIREMENTS */}
                <div className="lg:col-span-7">
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#C43C62] dark:text-[#F06D91] mb-3">Venue Requirements</h3>
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                    {/* Price Range */}
                    <div className="flex flex-col gap-1.5">
                      <label className={labelClass}>Price Range (INR)</label>
                      <div className="flex items-center gap-1.5">
                        <div className={fieldClass}>
                          <span className="text-xs font-bold text-[#756B70] dark:text-[#C8BCC0] select-none shrink-0">Min</span>
                          <input type="number" placeholder="0" value={filters.minPrice || ''} onChange={(e) => handleFilterChange('minPrice', e.target.value)} className={inputClass} />
                        </div>
                        <span className="text-[var(--text-muted)] font-bold shrink-0">—</span>
                        <div className={fieldClass}>
                          <span className="text-xs font-bold text-[#756B70] dark:text-[#C8BCC0] select-none shrink-0">Max</span>
                          <input type="number" placeholder="Max" value={filters.maxPrice || ''} onChange={(e) => handleFilterChange('maxPrice', e.target.value)} className={inputClass} />
                        </div>
                      </div>
                    </div>

                    {/* Guest Capacity */}
                    <div className="flex flex-col gap-1.5">
                      <label className={labelClass}>Guest Capacity</label>
                      <div className="flex items-center gap-1.5">
                        <div className={fieldClass}>
                          <span className="text-xs font-bold text-[#756B70] dark:text-[#C8BCC0] select-none shrink-0">Min</span>
                          <input type="number" placeholder="0" value={filters.minCapacity || ''} onChange={(e) => handleFilterChange('minCapacity', e.target.value)} className={inputClass} />
                        </div>
                        <span className="text-[var(--text-muted)] font-bold shrink-0">—</span>
                        <div className={fieldClass}>
                          <span className="text-xs font-bold text-[#756B70] dark:text-[#C8BCC0] select-none shrink-0">Max</span>
                          <input type="number" placeholder="Max" value={filters.maxCapacity || ''} onChange={(e) => handleFilterChange('maxCapacity', e.target.value)} className={inputClass} />
                        </div>
                      </div>
                    </div>

                    {/* Min Rating */}
                    <div className="flex flex-col gap-1.5">
                      <label className={labelClass}>Min Rating</label>
                      <div className={fieldClass}>
                        <div className="relative w-full flex items-center">
                          <select value={filters.minRating || ''} onChange={(e) => handleFilterChange('minRating', e.target.value)} className="w-full bg-transparent text-sm text-[#292326] dark:text-[#FFF7F5] outline-none pr-6 appearance-none cursor-pointer">
                            <option value="">Any Rating</option>
                            <option value="3">3+ ★</option>
                            <option value="4">4+ ★</option>
                            <option value="4.5">4.5+ ★</option>
                          </select>
                          <ChevronDown size={14} className="absolute right-0 text-[#756B70] dark:text-[#C8BCC0] pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* NEARBY SEARCH */}
                <div className="lg:col-span-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#C43C62] dark:text-[#F06D91]">Nearby Search</h3>
                    <button
                      type="button"
                      onClick={handleGetCurrentLocation}
                      className="text-xs font-extrabold text-[#E85D83] dark:text-[#F06D91] flex items-center gap-1 hover:text-[#C43C62] transition cursor-pointer"
                    >
                      <Navigation size={11} className="fill-current" />
                      <span>Use current location</span>
                    </button>
                  </div>
                  <div className="grid gap-3 grid-cols-3">
                    <div className="col-span-2">
                      <label className={labelClass}>Location / Area</label>
                      <div className={fieldClass}>
                        <div className="relative w-full flex items-center">
                          <select
                            value={hasCustomCoords ? 'custom' : (activeLocationIndex === -1 ? '' : activeLocationIndex)}
                            onChange={(e) => handleLocationSelect(e.target.value)}
                            className="w-full bg-transparent text-sm text-[#292326] dark:text-[#FFF7F5] outline-none pr-6 appearance-none cursor-pointer"
                          >
                            <option value="">Select area...</option>
                            {hasCustomCoords && <option value="custom">📍 Custom Map Coords</option>}
                            {presetLocations.map((loc, idx) => (
                              <option key={loc.name} value={idx}>{loc.name}</option>
                            ))}
                          </select>
                          <ChevronDown size={14} className="absolute right-0 text-[#756B70] dark:text-[#C8BCC0] pointer-events-none" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Radius (Km)</label>
                      <div className={fieldClass}>
                        <input type="number" placeholder="Km" value={filters.radiusKm || ''} onChange={(e) => handleFilterChange('radiusKm', e.target.value)} className={inputClass} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AMENITIES */}
              <div className="border-t border-[var(--border-light)] pt-5">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#C43C62] dark:text-[#F06D91] mb-3">Amenities</h3>
                <div className="flex flex-wrap gap-2.5">
                  {amenities.map((amenity) => {
                    const isSelected = filters.amenities?.includes(amenity);
                    return (
                      <button
                        key={amenity}
                        type="button"
                        onClick={() => toggleAmenity(amenity)}
                        className={`rounded-full px-4 py-2 text-xs font-bold capitalize border transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                          ? 'bg-[#E11D48] dark:bg-[#F06D91] text-white border-transparent shadow-sm'
                          : 'bg-transparent text-[#292524] dark:text-[#C8BCC0] border-stone-300 dark:border-white/10 hover:bg-[#FAF8F5] dark:hover:bg-[#2A2327]'
                        }`}
                      >
                        {isSelected && <Check size={12} className="stroke-[3]" />}
                        <span>{amenity}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SPACE PREFERENCE */}
              <div className="border-t border-[var(--border-light)] pt-5">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#C43C62] dark:text-[#F06D91] mb-3">Space Preference</h3>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleFilterChange('indoor', filters.indoor === 'true' ? '' : 'true')}
                    className={`rounded-full px-4 py-2 text-xs font-bold capitalize border transition-all flex items-center gap-1.5 cursor-pointer ${
                      filters.indoor === 'true'
                      ? 'bg-[#E11D48] dark:bg-[#F06D91] text-white border-transparent shadow-sm'
                      : 'bg-transparent text-[#292524] dark:text-[#C8BCC0] border-stone-300 dark:border-white/10 hover:bg-[#FAF8F5] dark:hover:bg-[#2A2327]'
                    }`}
                  >
                    {filters.indoor === 'true' && <Check size={12} className="stroke-[3]" />}
                    <span>Indoor</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFilterChange('outdoor', filters.outdoor === 'true' ? '' : 'true')}
                    className={`rounded-full px-4 py-2 text-xs font-bold capitalize border transition-all flex items-center gap-1.5 cursor-pointer ${
                      filters.outdoor === 'true'
                      ? 'bg-[#E11D48] dark:bg-[#F06D91] text-white border-transparent shadow-sm'
                      : 'bg-transparent text-[#292524] dark:text-[#C8BCC0] border-stone-300 dark:border-white/10 hover:bg-[#FAF8F5] dark:hover:bg-[#2A2327]'
                    }`}
                  >
                    {filters.outdoor === 'true' && <Check size={12} className="stroke-[3]" />}
                    <span>Outdoor</span>
                  </button>
                </div>
              </div>
            </div>

                    {/* Submit controls inside panel */}
                    <div className="mt-6 flex flex-wrap gap-3 border-t border-[var(--border-light)] pt-4">
                      <button type="button" onClick={handleApplyFilters} className="rounded-xl bg-[#E85D83] hover:bg-[#C43C62] dark:bg-[#F06D91] dark:hover:bg-[#E85D83] px-6 py-2.5 text-xs font-bold text-white transition hover:-translate-y-[1px] shadow-sm cursor-pointer">
                        Apply Filters
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      <div className="mx-auto mt-6 max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        {error && <div className="mb-4 rounded-lg bg-red-100 p-4 text-red-700">{error}</div>}

        {/* Split screen outer container, always displayed unless there is an error */}
        {!error && (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Left Column: Listings or Loading Skeletons */}
            <div className={`w-full lg:w-3/5 flex-1 ${mobileView === 'list' ? 'block' : 'hidden lg:block'}`}>
              {isLoading ? (
                <div>
                  <div className="mb-8 flex items-center justify-between">
                    <div className="h-7 w-48 animate-pulse rounded bg-stone-200 dark:bg-stone-800/40" />
                    <div className="h-11 w-44 animate-pulse rounded bg-stone-200 dark:bg-stone-800/40" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-6">
                    {Array.from({ length: pagination.limit || 6 }).map((_, idx) => (
                      <div key={idx} className="h-full max-w-md mx-auto sm:max-w-none w-full">
                        <VenueCardSkeleton />
                      </div>
                    ))}
                  </div>
                </div>
              ) : venues.length > 0 ? (
                <div>
                  <div className="mb-8 flex items-center justify-between">
                    <p className="text-lg text-[var(--text-muted)]">
                      Found <span className="font-semibold text-[#cf5577]">{venues.length}</span> venues
                      {pagination.total > venues.length && <span> of {pagination.total}</span>}
                    </p>
                    <div className="flex items-center gap-2 md:gap-3">
                      {/* Sorting dropdown */}
                      <div className="relative flex items-center bg-white/80 dark:bg-[#211C1F] border border-[#E5E7EB] dark:border-white/10 rounded-lg px-2.5 py-1.5 h-11 shadow-sm focus-within:border-[#E85D83] dark:focus-within:border-[#F06D91] transition-all">
                        <select
                          value={filters.sort || ''}
                          onChange={(e) => handleFilterChange('sort', e.target.value)}
                          className="bg-transparent text-xs font-bold text-[#292524] dark:text-[#FFF7F5] outline-none pr-5 appearance-none cursor-pointer focus:outline-none"
                          aria-label="Sort options"
                        >
                          <option value="" className="dark:bg-[#211C1F] text-[#292524] dark:text-[#FFF7F5]">Sort: Recommended</option>
                          <option value="rating-desc" className="dark:bg-[#211C1F] text-[#292524] dark:text-[#FFF7F5]">Rating: High to Low</option>
                          <option value="price-asc" className="dark:bg-[#211C1F] text-[#292524] dark:text-[#FFF7F5]">Price: Low to High</option>
                          <option value="price-desc" className="dark:bg-[#211C1F] text-[#292524] dark:text-[#FFF7F5]">Price: High to Low</option>
                          <option value="capacity-asc" className="dark:bg-[#211C1F] text-[#292524] dark:text-[#FFF7F5]">Capacity: Low to High</option>
                          <option value="capacity-desc" className="dark:bg-[#211C1F] text-[#292524] dark:text-[#FFF7F5]">Capacity: High to Low</option>
                        </select>
                        <ChevronDown size={12} className="absolute right-3 text-[#756B70] dark:text-[#C8BCC0] pointer-events-none" />
                      </div>

                      <button className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#ffd8c7] text-[#cf5577] clay-button shrink-0" aria-label="Grid view">
                        <Grid2X2 size={18} />
                      </button>
                      <button className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/70 text-[var(--text-muted)] clay-button shrink-0" aria-label="List view">
                        <List size={18} />
                      </button>
                    </div>
                  </div>

                  <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-6"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
                    }}
                  >
                    {venues.map((venue) => (
                      <motion.div
                        key={venue._id}
                        id={`venue-card-${venue._id}`}
                        onMouseEnter={() => setHoveredVenueId(venue._id)}
                        onMouseLeave={() => setHoveredVenueId(null)}
                        className="h-full max-w-md mx-auto sm:max-w-none w-full"
                        variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
                        transition={{ duration: 0.25 }}
                      >
                        <VenueCard venue={venue} />
                      </motion.div>
                    ))}
                  </motion.div>

                  {pagination.totalPages > 1 && (
                    <div className="mt-10 flex items-center justify-center gap-4">
                      <button onClick={() => dispatch(setPage(Math.max(1, pagination.page - 1)))} disabled={pagination.page === 1} className="rounded-lg bg-white/70 px-5 py-2 text-[var(--text-body)] disabled:opacity-50 clay-button">
                        Previous
                      </button>
                      <span className="text-[var(--text-body)]">Page {pagination.page} of {pagination.totalPages}</span>
                      <button onClick={() => dispatch(setPage(Math.min(pagination.totalPages, pagination.page + 1)))} disabled={pagination.page === pagination.totalPages} className="rounded-lg bg-white/70 px-5 py-2 text-[var(--text-body)] disabled:opacity-50 clay-button">
                        Next
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  className="mt-8 py-20 px-6 text-center clay-card flex flex-col items-center justify-center border border-[var(--border-light)] rounded-2xl bg-white dark:bg-[#211C1F] shadow-sm"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 mb-5 shadow-sm text-[#E85D83] dark:text-[#F06D91]">
                    <Search size={32} />
                  </div>
                  <h3 className="text-2xl font-extrabold text-[var(--text-dark)] mb-2">No venues found</h3>
                  <p className="text-sm text-[var(--text-muted)] max-w-md mb-6 leading-relaxed">
                    {filters.search ? (
                      <span>No results match "<span className="font-semibold text-[#E85D83] dark:text-[#F06D91]">{filters.search}</span>". Try checking your spelling or clearing filters.</span>
                    ) : (
                      <span>Try adjusting or clearing your filters to find exactly what you are looking for.</span>
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="rounded-xl bg-[#E85D83] hover:bg-[#C43C62] dark:bg-[#F06D91] dark:hover:bg-[#E85D83] px-6 py-3 text-xs font-bold text-white transition hover:-translate-y-[1px] shadow-sm cursor-pointer"
                  >
                    Clear All Filters
                  </button>
                </motion.div>
              )}
            </div>

            {/* Right Column: Sticky Interactive Map (always visible, even during loading states) */}
            <div className={`w-full lg:w-2/5 lg:sticky lg:top-[100px] z-10 shrink-0 ${
              mobileView === 'map' ? 'block h-[calc(100vh-160px)] lg:h-[650px]' : 'hidden lg:block h-[400px] lg:h-[650px]'
            }`}>
              <VenueMap
                venues={venues}
                hoveredVenueId={hoveredVenueId}
                zoom={filters.lat && filters.lng ? 12 : 11}
                onMapClick={handleMapClick}
                searchCenter={filters.lat && filters.lng ? [parseFloat(filters.lat), parseFloat(filters.lng)] : null}
                searchRadius={filters.lat && filters.lng ? parseFloat(filters.radiusKm || 15) : null}
              />
            </div>
          </div>
        )}

        {/* Floating Toggle Button for Mobile Screens */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 lg:hidden">
          <button
            onClick={() => setMobileView(mobileView === 'list' ? 'map' : 'list')}
            className="bg-[#352c32] dark:bg-[#ffd8c7] text-[#FFF7F5] dark:text-[#352c32] px-5 py-2.5 rounded-full shadow-xl font-extrabold text-xs tracking-wider uppercase transition active:scale-95 flex items-center gap-2 border border-white/10 dark:border-none hover:shadow-2xl"
          >
            {mobileView === 'list' ? (
              <>
                <Map size={14} />
                <span>Show Map</span>
              </>
            ) : (
              <>
                <List size={14} />
                <span>Show List</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
