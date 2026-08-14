import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Building2, Heart, MapPin, Search, Users, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../components/ThemeProvider';
import StaticVenueCard from '../components/StaticVenueCard';
import { staticVenues } from '../data/venues';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';

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

  const filteredVenues = selectedCity === 'all'
    ? staticVenues
    : staticVenues.filter(v => v.city.toLowerCase() === selectedCity.toLowerCase());

  return (
    <div className="w-full bg-[var(--bg-slate)] text-[var(--text-body)] transition-colors duration-300">
      
      {/* HERO SECTION */}
      <section
        className="relative flex min-h-[90vh] items-center bg-cover bg-center px-6 pb-20 pt-24 md:px-12"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=1974&auto=format&fit=crop')",
        }}
      >
        {/* Editorial overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/85 via-stone-950/50 to-transparent z-0" />
        
        {/* Bottom smooth container blending */}
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[var(--bg-slate)] via-[var(--bg-slate)]/40 to-transparent z-0 pointer-events-none" />

        <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1fr_420px]">
          
          {/* Left Intro Text Column */}
          <div className="max-w-2xl text-left">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary backdrop-blur select-none"
            >
              <Sparkles size={12} className="text-primary" />
              <span>Wedding venues, matched faster</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-white tracking-wide leading-tight"
            >
              Find the perfect <br />wedding venue for <br />your celebration.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.65 }}
              className="mt-6 text-stone-200/90 text-base leading-relaxed md:text-lg max-w-[540px]"
            >
              Browse beautiful spaces, compare shortlists, and contact verified organizers without losing the thread.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.65 }}
              className="mt-8 flex flex-wrap gap-4 select-none"
            >
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/venues')}
                className="shadow-md hover:shadow-lg"
              >
                Explore Venues
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/register')}
                className="border-white/40 text-white hover:bg-white hover:text-stone-900 shadow-sm"
              >
                List Your Venue
              </Button>
            </motion.div>
          </div>

          {/* Right Search Card Column */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="w-full"
          >
            <form onSubmit={handleSearch}>
              <Card className="shadow-lg border border-stone-200/20 backdrop-blur-md bg-white/95 dark:bg-stone-900/95 overflow-hidden">
                <CardContent className="p-6 md:p-8 flex flex-col gap-5">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-[var(--text-dark)] leading-none">
                      Start your search
                    </h2>
                    <p className="mt-2 text-xs text-[var(--text-muted)] font-medium">
                      Choose a location and estimated guests.
                    </p>
                  </div>

                  <Input
                    label="Location"
                    placeholder="City, area, or destination"
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    leftIcon={<MapPin size={16} className="text-primary" />}
                  />

                  <Input
                    label="Guests"
                    type="number"
                    placeholder="Estimated guest capacity"
                    value={guestCount}
                    onChange={(e) => setGuestCount(e.target.value)}
                    leftIcon={<Users size={16} className="text-primary" />}
                  />

                  <Button 
                    type="submit" 
                    variant="primary" 
                    size="lg"
                    className="w-full mt-2"
                    leftIcon={<Search size={16} />}
                  >
                    Search venues
                  </Button>
                </CardContent>
              </Card>
            </form>
          </motion.div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="mx-auto max-w-6xl px-6 py-6 -mt-10 relative z-20">
        <Card className="bg-white/80 dark:bg-[#1A1618]/80 backdrop-blur border border-[var(--border-light)] shadow-sm">
          <CardContent className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center select-none">
            {[
              { number: '500+', label: 'Luxury venues' },
              { number: '10K+', label: 'Happy couples' },
              { number: '25+', label: 'Cities covered' },
              { number: '4.9', label: 'Average rating' },
            ].map((stat, idx) => (
              <div key={stat.label} className={`flex flex-col gap-1.5 ${idx !== 0 ? 'md:border-l border-[var(--border-light)]' : ''}`}>
                <span className="text-2xl md:text-3xl font-serif font-extrabold text-primary">
                  {stat.number}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  {stat.label}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* FEATURED SHOWCASE SECTION */}
      <section className="mx-auto max-w-6xl px-6 py-24 z-10 relative">
        {/* Section Header */}
        <div className="text-center mb-12 max-w-2xl mx-auto flex flex-col gap-3">
          <h2 className="font-serif text-3xl md:text-4xl font-extrabold text-[var(--text-dark)] tracking-wide leading-tight">
            Explore Wedding Venues
          </h2>
          <p className="text-sm md:text-base text-[var(--text-muted)] font-medium leading-relaxed">
            Find the perfect space for your special day
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10 select-none">
          {['all', 'jaipur', 'delhi', 'mumbai', 'bangalore'].map((city) => {
            const isSelected = selectedCity.toLowerCase() === city.toLowerCase();
            return (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-5 py-2 text-xs md:text-sm font-semibold rounded-full transition-all duration-200 border cursor-pointer ${
                  isSelected
                    ? 'bg-primary text-white border-transparent shadow-sm'
                    : 'bg-white dark:bg-stone-900 text-[var(--text-muted)] border-stone-200 dark:border-stone-800 hover:text-primary hover:border-primary/20'
                }`}
              >
                {city === 'all' ? 'All Locations' : city.charAt(0).toUpperCase() + city.slice(1)}
              </button>
            );
          })}
        </div>

        {/* Grid of Venue Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredVenues.map((venue) => (
            <StaticVenueCard key={venue.id} venue={venue} />
          ))}
        </div>

        {/* View All Button */}
        <div className="mt-12 text-center select-none">
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/venues')}
            className="border-primary text-primary hover:bg-primary hover:text-white"
          >
            View All Venues
          </Button>
        </div>
      </section>

      {/* POPULAR CITIES SECTION */}
      <section className="mx-auto max-w-6xl px-6 py-20 border-t border-[var(--border-light)] z-10 relative">
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl flex flex-col gap-2">
            <h2 className="font-serif text-3xl md:text-4xl font-extrabold text-[var(--text-dark)] tracking-wide leading-tight">
              Popular Destinations
            </h2>
            <p className="text-sm md:text-base text-[var(--text-muted)] font-medium leading-relaxed">
              Start with wedding destinations couples search most often on WedVenue.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/venues')}
            rightIcon={<ArrowRight size={14} />}
            className="self-start md:self-auto select-none"
          >
            Browse all cities
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {popularCities.map((city) => (
            <button
              key={city.name}
              type="button"
              onClick={() => handleCityClick(city.searchValue)}
              className="group relative min-h-[280px] overflow-hidden rounded-2xl border border-stone-200/50 dark:border-white/5 text-left shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <img
                src={city.image}
                alt={`${city.name} wedding venues`}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/40 to-transparent" />
              
              <div className="relative z-10 flex h-full min-h-[280px] flex-col justify-between p-5">
                <Badge variant="neutral" className="bg-white/15 text-white border-white/10 backdrop-blur w-fit select-none">
                  <MapPin size={11} className="mr-1 shrink-0" />
                  <span>{city.region}</span>
                </Badge>

                <div>
                  <div className="mb-2.5 flex items-end justify-between gap-4">
                    <div>
                      <h3 className="font-serif text-2xl font-bold text-white leading-tight">
                        {city.name}
                      </h3>
                      <p className="mt-0.5 text-xs font-semibold text-white/80">
                        {city.venueCount}
                      </p>
                    </div>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-stone-900 transition-transform duration-350 group-hover:translate-x-1 shadow-sm select-none">
                      <ArrowRight size={16} />
                    </span>
                  </div>
                  <p className="text-xs text-white/85 leading-relaxed">
                    {city.highlight}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* WHY CHOOSE US SECTION */}
      <section className="mx-auto max-w-6xl px-6 py-20 border-t border-[var(--border-light)] z-10 relative">
        <div className="mb-12 text-center max-w-2xl mx-auto flex flex-col gap-3">
          <h2 className="font-serif text-3xl md:text-4xl font-extrabold text-[var(--text-dark)] tracking-wide leading-tight">
            Why Choose WedVenue?
          </h2>
          <p className="text-sm md:text-base text-[var(--text-muted)] font-medium leading-relaxed">
            Everything you need for a confident venue shortlist.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
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
              <Card key={feature.title} className="hover:-translate-y-1 transition-all duration-300">
                <CardContent className="p-6 md:p-8 flex flex-col gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm select-none">
                    <Icon size={22} />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[var(--text-dark)]">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--text-body)]">
                      {feature.text}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CALL TO ACTION SECTION */}
      <section className="mx-auto max-w-6xl px-6 pb-24 z-10 relative">
        <Card className="bg-primary/5 dark:bg-[#1A1618]/30 border border-primary/15 overflow-hidden">
          <CardContent className="p-8 md:p-12 text-center flex flex-col items-center justify-center gap-6 max-w-3xl mx-auto">
            <h2 className="font-serif text-3xl md:text-4xl font-extrabold text-[var(--text-dark)] tracking-wide leading-tight">
              Ready to find your wedding venue?
            </h2>
            <p className="text-sm md:text-base text-[var(--text-muted)] font-medium leading-relaxed">
              Explore hundreds of palatial properties, seaside resorts, and modern banquets. Create a shortlist and plan your dream wedding celebration with ease.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-2 select-none">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/venues')}
                className="shadow-sm"
              >
                Browse All Venues
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/register')}
                className="border-primary/30 text-primary hover:bg-primary/10"
              >
                List Your Space
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
