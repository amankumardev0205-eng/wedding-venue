import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Building2, Heart, MapPin, Search, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../components/ThemeProvider';
import StaticVenueCard from '../components/StaticVenueCard';
import { staticVenues } from '../data/venues';

const popularCities = [
  {
    name: 'Jaipur',
    region: 'Rajasthan',
    searchValue: 'jaipur',
    venueCount: '120+ venues',
    highlight: 'Heritage palaces and royal lawns',
    image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Udaipur',
    region: 'Rajasthan',
    searchValue: 'udaipur',
    venueCount: '85+ venues',
    highlight: 'Lakefront resorts and palace stays',
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Mumbai',
    region: 'Maharashtra',
    searchValue: 'mumbai',
    venueCount: '140+ venues',
    highlight: 'Sea-view hotels and elegant ballrooms',
    image: 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Goa',
    region: 'Beach weddings',
    searchValue: 'south goa',
    venueCount: '70+ venues',
    highlight: 'Beach resorts and sunset ceremonies',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Delhi NCR',
    region: 'Delhi NCR',
    searchValue: 'new delhi',
    venueCount: '160+ venues',
    highlight: 'Luxury banquets and grand farmhouses',
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Bengaluru',
    region: 'Karnataka',
    searchValue: 'bengaluru',
    venueCount: '95+ venues',
    highlight: 'Garden venues and premium hotels',
    image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=900&q=80',
  },
];

export default function WeddingLandingPage() {
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const [searchCity, setSearchCity] = useState('');
  const [guestCount, setGuestCount] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchCity.trim()) params.set('city', searchCity.trim());
    if (guestCount) params.set('guests', guestCount);
    navigate(params.toString() ? `/venues?${params.toString()}` : '/venues');
  };

  const handleCityClick = (city) => {
    navigate(`/venues?city=${encodeURIComponent(city)}`);
  };

  const isDark = theme === 'dark';
  const fadeColor = isDark ? '23, 20, 22' : '255, 248, 243';
  const cardBg = isDark ? 'rgba(33, 28, 31, 0.85)' : 'rgba(255, 250, 246, 0.92)';
  const cardBorder = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.8)';
  const titleColor = isDark ? 'text-[#FFF7F5]' : 'text-[#292326]';
  const subtitleColor = isDark ? 'text-[#C8BCC0]' : 'text-[#756B70]';

  const inputContainerClass = isDark
    ? 'mb-3.5 flex items-center gap-3 px-3 py-2.5 rounded-lg border border-white/10 bg-[#2A2327]/60 focus-within:border-[#F06D91] transition'
    : 'mb-3.5 flex items-center gap-3 px-3 py-2.5 rounded-lg border border-[rgba(80,60,70,0.15)] bg-[#FFFCFA] focus-within:border-[#E85D83] transition';
    
  const inputClass = isDark
    ? 'w-full bg-transparent text-sm text-[#FFF7F5] outline-none placeholder:text-[#C8BCC0]'
    : 'w-full bg-transparent text-sm text-[#292326] outline-none placeholder:text-[#6B6265]';

  const searchButtonClass = isDark
    ? 'w-full py-3 bg-[#F06D91] hover:bg-[#E85D83] text-white rounded-lg font-bold transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 hover:-translate-y-[2px]'
    : 'w-full py-3 bg-[#342B31] hover:bg-[#292326] text-white rounded-lg font-bold transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 hover:-translate-y-[2px]';

  const getPillClass = (city) => {
    const isSelected = selectedCity.toLowerCase() === city.toLowerCase();
    return `px-5 py-2 text-xs md:text-sm font-bold rounded-full transition-all duration-200 border cursor-pointer ${
      isSelected
        ? 'bg-[#E85D83] dark:bg-[#F06D91] text-white border-transparent shadow-sm'
        : 'bg-[#FFFCFA] dark:bg-[#211C1F] text-[#756B70] dark:text-[#C8BCC0] border-[rgba(80,60,70,0.15)] dark:border-white/10 hover:bg-[#FFF8F3] hover:text-[#292326] dark:hover:bg-[#2A2327] dark:hover:text-[#FFF7F5] hover:scale-102 hover:shadow-sm'
    }`;
  };

  const filteredVenues = selectedCity === 'all'
    ? staticVenues
    : staticVenues.filter(v => v.city.toLowerCase() === selectedCity.toLowerCase());

  return (
    <div className="w-full bg-[var(--bg-slate)] text-[var(--text-dark)]">
      <section
        className="relative flex min-h-[85vh] items-center bg-cover bg-center px-4 pb-14 pt-16 md:px-8"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=1974&auto=format&fit=crop')",
        }}
      >
        {/* Subtle multi-directional gradient overlay protecting readability while preserving original image */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(20, 15, 20, 0.55) 0%, rgba(20, 15, 20, 0.28) 45%, rgba(20, 15, 20, 0.08) 75%, rgba(20, 15, 20, 0.02) 100%)',
          }}
        />
        
        {/* Soft white/cream gradient fading into next section */}
        <div
          className="absolute inset-x-0 bottom-0 h-40 z-0"
          style={{
            background: `linear-gradient(to bottom, transparent 40%, rgba(${fadeColor}, 0.98) 100%)`,
          }}
        />

        <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-10 md:grid-cols-[minmax(0,1fr)_420px]">
          <div className="max-w-3xl">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-4 text-xs md:text-sm font-bold uppercase tracking-[3px] text-[#F6A6B9] dark:text-[#F06D91]"
              style={{ textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}
            >
              Wedding venues, matched faster
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="max-w-4xl text-4xl font-extrabold tracking-[-1px] leading-[1.05] text-white sm:text-5xl lg:text-6xl"
              style={{ textShadow: '0 3px 12px rgba(0,0,0,0.25)' }}
            >
              Find Your Dream<br />Wedding Venue
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.65 }}
              className="mt-5 max-w-[600px] text-base leading-[1.6] text-white/95 md:text-lg"
              style={{ textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}
            >
              Browse beautiful spaces, compare shortlists, and contact verified organizers without losing the thread.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.65 }}
              className="mt-8 flex flex-row gap-4 h-12"
            >
              <button
                onClick={() => navigate('/venues')}
                className="inline-flex items-center justify-center rounded-xl bg-[#E85D83] hover:bg-[#C43C62] px-6 py-3 text-sm font-bold text-white shadow-sm hover:-translate-y-[2px] hover:shadow-md transition-all duration-200 h-full"
              >
                Explore Venues
              </button>
              <button
                onClick={() => navigate('/register')}
                className="inline-flex items-center justify-center rounded-xl border border-white/50 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur shadow-sm hover:bg-white hover:text-[#292326] hover:-translate-y-[2px] hover:shadow-md transition-all duration-200 h-full"
              >
                List Your Venue
              </button>
            </motion.div>
          </div>

          <motion.form
            onSubmit={handleSearch}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="w-full p-6 backdrop-blur shadow-sm transition hover:shadow-md"
            style={{
              background: cardBg,
              borderColor: cardBorder,
              borderWidth: '1px',
              borderRadius: '16px'
            }}
          >
            <div className="mb-5">
              <h2 className={`text-xl font-extrabold ${titleColor}`}>Start your venue search</h2>
              <p className={`mt-1.5 text-xs font-medium ${subtitleColor}`}>Choose a city and estimated guest count.</p>
            </div>

            <div className={inputContainerClass}>
              <MapPin size={18} className="shrink-0 text-[#E85D83] dark:text-[#F06D91]" />
              <input
                type="text"
                placeholder="City, area, or destination"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className={inputContainerClass}>
              <Users size={18} className="shrink-0 text-[#E85D83] dark:text-[#F06D91]" />
              <input
                type="number"
                placeholder="Guests"
                value={guestCount}
                onChange={(e) => setGuestCount(e.target.value)}
                className={inputClass}
              />
            </div>

            <button type="submit" className={searchButtonClass}>
              <Search size={16} />
              <span>Search venues</span>
            </button>
          </motion.form>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-12 md:grid-cols-4 md:px-8 mt-6 relative z-10">
        {[
          { number: '500+', label: 'Luxury venues' },
          { number: '10K+', label: 'Happy couples' },
          { number: '25+', label: 'Cities covered' },
          { number: '4.9', label: 'Average rating' },
        ].map((stat) => (
          <div key={stat.label} className="clay-card p-5 hover:shadow-md transition-shadow">
            <h2 className="text-2xl font-extrabold text-[#E85D83] dark:text-[#F06D91] md:text-3xl">{stat.number}</h2>
            <p className="mt-1 text-sm font-medium text-[var(--text-muted)]">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* Explore Wedding Venues Showcase Section */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8 border-t border-[var(--border-light)] z-10 relative">
        {/* Section Header */}
        <div className="text-center mb-10 max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold text-[var(--text-dark)] md:text-4xl">
            Explore Wedding Venues
          </h2>
          <p className="mt-3 text-base leading-relaxed text-[var(--text-muted)]">
            Find the perfect space for your special day
          </p>
        </div>

        {/* City Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          {['all', 'jaipur', 'delhi', 'mumbai', 'bangalore'].map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={getPillClass(city)}
            >
              {city === 'all' ? 'All' : city.charAt(0).toUpperCase() + city.slice(1)}
            </button>
          ))}
        </div>

        {/* Grid of Venue Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredVenues.map((venue) => (
            <StaticVenueCard key={venue.id} venue={venue} />
          ))}
        </div>

        {/* View All Button */}
        <div className="mt-12 text-center shrink-0">
          <button
            onClick={() => navigate('/venues')}
            className="inline-flex items-center justify-center rounded-xl border border-[#E85D83] dark:border-[#F06D91] text-[#E85D83] dark:text-[#F06D91] hover:bg-[#E85D83] hover:text-white dark:hover:bg-[#F06D91] dark:hover:text-[#171416] px-8 py-3 text-sm font-extrabold shadow-sm hover:-translate-y-[2px] transition-all duration-200"
          >
            View All Venues
          </button>
        </div>
      </section>

      {/* Popular Cities Section */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8 border-t border-[var(--border-light)] z-10 relative">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-extrabold text-[var(--text-dark)] md:text-4xl">
              Popular Cities
            </h2>
            <p className="mt-3 text-base leading-relaxed text-[var(--text-muted)]">
              Start with wedding destinations couples search most often on WedVenue.
            </p>
          </div>
          <button
            onClick={() => navigate('/venues')}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[var(--border-light)] bg-white/60 dark:bg-white/10 px-5 text-sm font-extrabold text-[var(--text-dark)] shadow-sm transition-all duration-200 hover:-translate-y-[2px] hover:border-[#E85D83] hover:text-[#E85D83] dark:hover:border-[#F06D91] dark:hover:text-[#F06D91] md:self-auto"
          >
            <span>Browse all cities</span>
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {popularCities.map((city) => (
            <button
              key={city.name}
              type="button"
              onClick={() => handleCityClick(city.searchValue)}
              className="group relative min-h-[260px] overflow-hidden rounded-lg border border-[var(--border-light)] text-left shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E85D83] dark:focus-visible:ring-[#F06D91]"
            >
              <img
                src={city.image}
                alt={`${city.name} wedding venues`}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#171416]/85 via-[#171416]/38 to-[#171416]/8" />
              <div className="relative z-10 flex h-full min-h-[260px] flex-col justify-between p-5">
                <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-bold text-white backdrop-blur">
                  <MapPin size={13} />
                  <span>{city.region}</span>
                </div>

                <div>
                  <div className="mb-3 flex items-end justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-extrabold text-white md:text-3xl">{city.name}</h3>
                      <p className="mt-1 text-sm font-semibold text-white/85">{city.venueCount}</p>
                    </div>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#292326] transition-transform duration-300 group-hover:translate-x-1">
                      <ArrowRight size={18} />
                    </span>
                  </div>
                  <p className="text-sm font-medium leading-6 text-white/90">{city.highlight}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
        <div className="mb-8 max-w-2xl">
          <h2 className="text-3xl font-extrabold text-[var(--text-dark)] md:text-4xl">Why Choose WedVenue?</h2>
          <p className="mt-3 text-base leading-7 text-[var(--text-body)]">
            Everything you need for a confident venue shortlist.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Search,
              title: 'Smart Search',
              text: 'Filter venues by city, guest capacity, pricing, and style preferences.',
            },
            {
              icon: Heart,
              title: 'Save Favorites',
              text: 'Build a shortlist and compare the spaces that actually fit your plans.',
            },
            {
              icon: Building2,
              title: 'Trusted Organizers',
              text: 'Contact verified venue teams directly and keep planning details organized.',
            },
          ].map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="clay-card p-6 hover:-translate-y-1 transition-transform duration-300">
                <Icon className="mb-4 text-[#E85D83] dark:text-[#F06D91]" size={30} />
                <h3 className="text-xl font-extrabold text-[var(--text-dark)]">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--text-body)]">{feature.text}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
