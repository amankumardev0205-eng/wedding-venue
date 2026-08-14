import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Grid2X2,
  List,
  Map,
  MapPin,
  Search,
  SlidersHorizontal,
  Users,
  Navigation,
  Check,
  ChevronDown,
  Sparkles,
  DollarSign,
  Star,
  Trash2
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

// UI components
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { Card, CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';

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
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
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
    setIsMobileFilterOpen(false);
  };

  const handleApplyFilters = () => {
    setIsMobileFilterOpen(false);
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

  // Shared Filters Form Content
  const renderFilterContent = () => (
    <div className="space-y-6">
      {/* PRIMARY FILTERS GROUP */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-[var(--border-light)] pb-1 flex items-center gap-1.5 select-none">
          <Building2 size={13} />
          <span>Primary Filters</span>
        </h3>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Select 
            label="State" 
            value={filters.state || ''} 
            onChange={(e) => handleStateChange(e.target.value)}
          >
            <option value="">All States</option>
            <option value="rajasthan">Rajasthan</option>
            <option value="goa">Goa</option>
            <option value="maharashtra">Maharashtra</option>
            <option value="delhi ncr">Delhi NCR</option>
            <option value="karnataka">Karnataka</option>
          </Select>

          <Select 
            label="City" 
            value={filters.city || ''} 
            onChange={(e) => handleFilterChange('city', e.target.value)}
          >
            <option value="">All Cities</option>
            {citiesForSelectedState.map((city) => (
              <option key={city} value={city} className="capitalize">{city}</option>
            ))}
          </Select>

          <Input 
            label="Search" 
            placeholder="Venue name..." 
            value={localSearch} 
            onChange={(e) => setLocalSearch(e.target.value)}
            leftIcon={<Search size={14} className="text-[var(--text-muted)]" />}
          />

          <Select 
            label="Venue Type" 
            value={filters.venueType || ''} 
            onChange={(e) => handleFilterChange('venueType', e.target.value)}
          >
            <option value="">All Types</option>
            <option value="banquet">Banquet</option>
            <option value="resort">Resort</option>
            <option value="lawn">Lawn</option>
            <option value="hotel">Hotel</option>
            <option value="club">Club</option>
          </Select>
        </div>
      </div>

      {/* REQUIREMENTS & RADIUS */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-12 border-t border-[var(--border-light)] pt-5">
        {/* Requirements */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-[var(--border-light)] pb-1 flex items-center gap-1.5 select-none">
            <Sparkles size={13} />
            <span>Venue Requirements</span>
          </h3>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            {/* Price Range */}
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-[var(--text-dark)] select-none">Price per Plate</span>
              <div className="flex items-center gap-2">
                <Input 
                  type="number" 
                  placeholder="Min" 
                  value={filters.minPrice || ''} 
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="flex-1"
                />
                <span className="text-[var(--text-muted)] font-bold">—</span>
                <Input 
                  type="number" 
                  placeholder="Max" 
                  value={filters.maxPrice || ''} 
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Capacity Range */}
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-[var(--text-dark)] select-none">Guest Capacity</span>
              <div className="flex items-center gap-2">
                <Input 
                  type="number" 
                  placeholder="Min" 
                  value={filters.minCapacity || ''} 
                  onChange={(e) => handleFilterChange('minCapacity', e.target.value)}
                  className="flex-1"
                />
                <span className="text-[var(--text-muted)] font-bold">—</span>
                <Input 
                  type="number" 
                  placeholder="Max" 
                  value={filters.maxCapacity || ''} 
                  onChange={(e) => handleFilterChange('maxCapacity', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Min Rating */}
            <Select 
              label="Min Rating" 
              value={filters.minRating || ''} 
              onChange={(e) => handleFilterChange('minRating', e.target.value)}
            >
              <option value="">Any Rating</option>
              <option value="3">3+ ★</option>
              <option value="4">4+ ★</option>
              <option value="4.5">4.5+ ★</option>
            </Select>
          </div>
        </div>

        {/* Nearby Area Search */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[var(--border-light)] pb-1 select-none">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <MapPin size={13} />
              <span>Nearby Search</span>
            </h3>
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              className="text-xs font-bold text-primary flex items-center gap-1 hover:underline cursor-pointer"
            >
              <Navigation size={11} className="fill-current" />
              <span>Use current location</span>
            </button>
          </div>
          <div className="grid gap-4 grid-cols-3">
            <Select 
              label="Location / Area" 
              value={hasCustomCoords ? 'custom' : (activeLocationIndex === -1 ? '' : activeLocationIndex)}
              onChange={(e) => handleLocationSelect(e.target.value)}
              className="col-span-2"
            >
              <option value="">Select area...</option>
              {hasCustomCoords && <option value="custom">📍 Custom Map Coords</option>}
              {presetLocations.map((loc, idx) => (
                <option key={loc.name} value={idx}>{loc.name}</option>
              ))}
            </Select>
            <Input 
              label="Radius (Km)" 
              type="number" 
              placeholder="Km" 
              value={filters.radiusKm || ''} 
              onChange={(e) => handleFilterChange('radiusKm', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* AMENITIES */}
      <div className="border-t border-[var(--border-light)] pt-5 flex flex-col gap-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 select-none">
          <Check size={13} />
          <span>Amenities</span>
        </h3>
        <div className="flex flex-wrap gap-2 select-none">
          {amenities.map((amenity) => {
            const isSelected = filters.amenities?.includes(amenity);
            return (
              <button
                key={amenity}
                type="button"
                onClick={() => toggleAmenity(amenity)}
                className={`rounded-full px-4 py-2 text-xs font-bold capitalize border transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                  ? 'bg-primary text-white border-transparent shadow-sm'
                  : 'bg-transparent text-[var(--text-body)] border-stone-200 dark:border-stone-850 hover:bg-primary/5 hover:border-primary/20'
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
      <div className="border-t border-[var(--border-light)] pt-5 flex flex-col gap-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 select-none">
          <Sparkles size={13} />
          <span>Space Preference</span>
        </h3>
        <div className="flex flex-wrap gap-2 select-none">
          <button
            type="button"
            onClick={() => handleFilterChange('indoor', filters.indoor === 'true' ? '' : 'true')}
            className={`rounded-full px-4 py-2 text-xs font-bold capitalize border transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
              filters.indoor === 'true'
              ? 'bg-primary text-white border-transparent shadow-sm'
              : 'bg-transparent text-[var(--text-body)] border-stone-200 dark:border-stone-850 hover:bg-primary/5 hover:border-primary/20'
            }`}
          >
            {filters.indoor === 'true' && <Check size={12} className="stroke-[3]" />}
            <span>Indoor</span>
          </button>
          <button
            type="button"
            onClick={() => handleFilterChange('outdoor', filters.outdoor === 'true' ? '' : 'true')}
            className={`rounded-full px-4 py-2 text-xs font-bold capitalize border transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
              filters.outdoor === 'true'
              ? 'bg-primary text-white border-transparent shadow-sm'
              : 'bg-transparent text-[var(--text-body)] border-stone-200 dark:border-stone-850 hover:bg-primary/5 hover:border-primary/20'
            }`}
          >
            {filters.outdoor === 'true' && <Check size={12} className="stroke-[3]" />}
            <span>Outdoor</span>
          </button>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex items-center gap-3 border-t border-[var(--border-light)] pt-5 select-none">
        <Button 
          type="button" 
          variant="primary" 
          onClick={handleApplyFilters}
          className="shadow-sm"
        >
          Apply Filters
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleClearFilters}
          className="text-stone-500 border-stone-200 hover:bg-stone-50 dark:border-stone-800 dark:hover:bg-stone-900"
        >
          Clear All
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen text-[var(--text-body)] pt-8 pb-16 bg-[var(--bg-slate)] transition-colors duration-300">
      
      {/* PAGE HEADER */}
      <section className="relative overflow-hidden">
        <div className="relative mx-auto max-w-6xl px-6 pb-4 flex flex-col gap-2">
          <div className="max-w-3xl flex flex-col gap-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Venue Discovery</span>
            <h1 className="font-serif text-3xl md:text-5xl font-extrabold text-[var(--text-dark)] leading-tight tracking-wide">
              Find the perfect wedding venue
            </h1>
            <p className="text-sm md:text-base text-[var(--text-muted)] font-medium leading-relaxed max-w-[620px]">
              Search, filter, compare, and send inquiries from one clean planning flow.
            </p>
          </div>

          {/* Collapsible Filter Panel (Desktop only) */}
          <div className="hidden lg:block mt-8 bg-[var(--bg-card)] border border-[var(--border-medium)] rounded-2xl shadow-sm overflow-hidden transition-all duration-300">
            {/* Header row / toggle bar inside panel */}
            <div className="flex items-center justify-between border-b border-[var(--border-light)] bg-stone-50/20 dark:bg-stone-900/5">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                aria-expanded={showFilters}
                className="flex-1 flex items-center justify-between gap-5 p-5 hover:bg-primary/5 transition-all text-left cursor-pointer focus:outline-none focus-visible:bg-primary/5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm shrink-0 select-none">
                    <SlidersHorizontal size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[var(--text-dark)] flex flex-wrap items-center gap-2">
                      <span>Filter Options</span>
                      {activeFilterCount > 0 && (
                        <span className="inline-flex items-center justify-center bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 shadow-sm select-none">
                          {activeFilterCount} Active
                        </span>
                      )}
                      <span className="inline-flex items-center justify-center text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md shrink-0 select-none shadow-sm">
                        {resultText}
                      </span>
                    </h2>
                    <p className="text-xs text-[var(--text-muted)] font-semibold mt-0.5 select-none">
                      {showFilters ? 'Click to collapse filter panel' : 'Click to expand filter panel'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 select-none">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">
                    {showFilters ? 'Collapse' : 'Expand'}
                  </span>
                  <motion.div
                    animate={{ rotate: showFilters ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="text-[var(--text-muted)]" size={18} />
                  </motion.div>
                </div>
              </button>
              
              <div className="pr-5 shrink-0 flex items-center select-none">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters} 
                  className="text-primary border-primary/20 hover:bg-primary hover:text-white"
                >
                  Clear all
                </Button>
              </div>
            </div>

            {/* Active filter summary row */}
            {activeTags.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto py-3 px-5 border-b border-[var(--border-light)] max-w-full select-none">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] shrink-0 mr-1.5">
                  Active Filters:
                </span>
                <div className="flex items-center gap-2 max-w-full">
                  <AnimatePresence>
                    {activeTags.map((tag) => (
                      <motion.div
                        key={tag.id}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="inline-flex items-center gap-1 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-full pl-3 pr-1.5 py-0.5 text-xs text-[var(--text-body)] shrink-0 shadow-sm"
                      >
                        <span className="truncate max-w-[150px] font-semibold capitalize">{tag.label}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            tag.onRemove();
                          }}
                          className="h-4.5 w-4.5 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:bg-primary/10 hover:text-primary transition cursor-pointer"
                          aria-label={`Remove filter: ${tag.label}`}
                        >
                          <svg className="h-2.5 w-2.5 stroke-[3]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
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
                  <div className="p-6">
                    {renderFilterContent()}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Filter Button (lg:hidden) */}
          <div className="lg:hidden mt-4 flex items-center justify-between gap-3 select-none">
            <Button
              variant="outline"
              className="w-full flex justify-between items-center bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-850 px-5 py-3 rounded-xl shadow-sm text-stone-700 dark:text-stone-300"
              onClick={() => setIsMobileFilterOpen(true)}
              leftIcon={<SlidersHorizontal size={14} />}
              rightIcon={
                activeFilterCount > 0 && (
                  <Badge variant="primary" className="bg-primary text-white border-transparent py-0 px-2 font-bold ml-2 shrink-0">
                    {activeFilterCount}
                  </Badge>
                )
              }
            >
              <span>Filter Options</span>
            </Button>
            <Button 
              variant="outline"
              onClick={handleClearFilters}
              disabled={activeFilterCount === 0}
              className="px-4 py-3 bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-850 shrink-0 text-red-600 border-red-200/50"
              title="Clear all"
            >
              <Trash2 size={15} />
            </Button>
          </div>
        </div>
      </section>

      {/* MOBILE FILTERS MODAL */}
      <Modal
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        title="Filter Venues"
        size="lg"
      >
        <div className="py-2">
          {renderFilterContent()}
        </div>
      </Modal>

      {/* SPLIT SECTION: LISTINGS & MAP */}
      <div className="mx-auto mt-6 max-w-6xl px-6">
        
        {/* Error Handling */}
        {error && (
          <ErrorState 
            title="Unable to load venues"
            message={error}
            onRetry={fetchVenues}
          />
        )}

        {!error && (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* Left Column: Listings or Loading Skeletons */}
            <div className={`w-full lg:w-3/5 flex-1 ${mobileView === 'list' ? 'block' : 'hidden lg:block'}`}>
              
              {isLoading ? (
                <div>
                  <div className="mb-6 flex items-center justify-between select-none">
                    <div className="h-5 w-32 animate-pulse rounded-lg bg-stone-200 dark:bg-stone-800/40" />
                    <div className="h-9 w-40 animate-pulse rounded-lg bg-stone-200 dark:bg-stone-800/40" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {Array.from({ length: pagination.limit || 6 }).map((_, idx) => (
                      <div key={idx} className="w-full">
                        <VenueCardSkeleton />
                      </div>
                    ))}
                  </div>
                </div>
              ) : venues.length > 0 ? (
                <div>
                  <div className="mb-6 flex items-center justify-between select-none">
                    <p className="text-sm font-semibold text-[var(--text-muted)]">
                      Found <span className="text-primary font-bold">{venues.length}</span> venues
                      {pagination.total > venues.length && <span> of {pagination.total}</span>}
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Sorting dropdown */}
                      <Select
                        value={filters.sort || ''}
                        onChange={(e) => handleFilterChange('sort', e.target.value)}
                        className="w-40 md:w-48 text-xs shrink-0"
                        aria-label="Sort options"
                      >
                        <option value="">Recommended</option>
                        <option value="rating-desc">Rating: High to Low</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                        <option value="capacity-asc">Capacity: Low to High</option>
                        <option value="capacity-desc">Capacity: High to Low</option>
                      </Select>

                      <button className="hidden sm:flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0" aria-label="Grid view">
                        <Grid2X2 size={15} />
                      </button>
                      <button className="hidden sm:flex h-9 w-9 items-center justify-center rounded-xl bg-white dark:bg-stone-900 text-[var(--text-muted)] border border-stone-200 dark:border-stone-850 shrink-0" aria-label="List view">
                        <List size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Listings Grid */}
                  <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
                    }}
                  >
                    {venues.map((venue) => (
                      <motion.div
                        key={venue._id}
                        id={`venue-card-${venue._id}`}
                        onMouseEnter={() => setHoveredVenueId(venue._id)}
                        onMouseLeave={() => setHoveredVenueId(null)}
                        className="w-full h-full"
                        variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                      >
                        <VenueCard venue={venue} />
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Pagination controls */}
                  {pagination.totalPages > 1 && (
                    <div className="mt-12 flex items-center justify-center gap-4 select-none">
                      <Button 
                        variant="outline"
                        onClick={() => dispatch(setPage(Math.max(1, pagination.page - 1)))} 
                        disabled={pagination.page === 1}
                        className="py-2.5 px-4 font-bold border-stone-200 dark:border-stone-800"
                      >
                        Previous
                      </Button>
                      <span className="text-sm font-semibold text-[var(--text-dark)]">
                        Page {pagination.page} of {pagination.totalPages}
                      </span>
                      <Button 
                        variant="outline"
                        onClick={() => dispatch(setPage(Math.min(pagination.totalPages, pagination.page + 1)))} 
                        disabled={pagination.page === pagination.totalPages}
                        className="py-2.5 px-4 font-bold border-stone-200 dark:border-stone-800"
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <EmptyState 
                  title="No venues match your filters"
                  description={
                    filters.search 
                      ? `No search results for "${filters.search}". Check your spelling or clear filter categories.`
                      : "Try adjusting your filters (like state, capacity, or nearby search radius) to find matching wedding venues."
                  }
                  action={
                    <Button 
                      variant="primary" 
                      onClick={handleClearFilters}
                      className="shadow-sm"
                    >
                      Clear All Filters
                    </Button>
                  }
                />
              )}
            </div>

            {/* Right Column: Sticky Interactive Map */}
            <div className={`w-full lg:w-2/5 lg:sticky lg:top-[112px] z-10 shrink-0 border border-stone-200/50 dark:border-stone-800/40 rounded-2xl overflow-hidden shadow-sm ${
              mobileView === 'map' ? 'block h-[calc(100vh-180px)] lg:h-[620px]' : 'hidden lg:block h-[400px] lg:h-[620px]'
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
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 lg:hidden select-none">
          <button
            onClick={() => setMobileView(mobileView === 'list' ? 'map' : 'list')}
            className="bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 px-6 py-3 rounded-full shadow-lg font-bold text-xs tracking-wider uppercase transition active:scale-95 flex items-center gap-2 border border-white/10 dark:border-none hover:shadow-xl"
          >
            {mobileView === 'list' ? (
              <>
                <Map size={13} />
                <span>Show Map</span>
              </>
            ) : (
              <>
                <List size={13} />
                <span>Show List</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
