import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Star, X, MapPin, Users, Tag, ArrowLeft, Trash2, HelpCircle } from 'lucide-react';

import { removeFromCompare, clearCompare } from '../redux/compareSlice';
import { getVenueCardImageUrl, handleImageError } from '../utils/imageUtils';

// UI components
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';

export default function CompareVenues() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedVenues } = useSelector((state) => state.compare || { selectedVenues: [] });

  if (selectedVenues.length === 0) {
    return (
      <div className="min-h-screen text-[var(--text-body)] pt-8 pb-16 bg-[var(--bg-slate)] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex select-none">
            <Button
              onClick={() => navigate('/venues')}
              variant="ghost"
              size="sm"
              className="mb-6 px-3 py-1.5 text-primary hover:bg-primary/5 gap-1.5 font-bold"
              leftIcon={<ArrowLeft size={15} />}
            >
              Back to Venues
            </Button>
          </div>

          <EmptyState
            title="No venues selected for comparison"
            description="Add venues you love to your comparison shortlist to evaluate details side by side."
            action={
              <Button 
                variant="primary" 
                onClick={() => navigate('/venues')}
                className="shadow-sm font-bold"
              >
                Browse Venues
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  const handleRemoveVenue = (venueId) => {
    dispatch(removeFromCompare(venueId));
  };

  const handleClearAll = () => {
    dispatch(clearCompare());
    navigate('/venues');
  };

  return (
    <div className="min-h-screen text-[var(--text-body)] pt-8 pb-16 bg-[var(--bg-slate)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Back Link */}
        <div className="flex select-none">
          <Button
            onClick={() => navigate('/venues')}
            variant="ghost"
            size="sm"
            className="mb-6 px-3 py-1.5 text-primary hover:bg-primary/5 gap-1.5 font-bold"
            leftIcon={<ArrowLeft size={15} />}
          >
            Back to Venues
          </Button>
        </div>

        {/* Page Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-5 select-none">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Side by Side</span>
            <h1 className="font-serif text-3xl md:text-5xl font-extrabold text-[var(--text-dark)] leading-tight tracking-wide">
              Compare Venues
            </h1>
            <p className="text-sm text-[var(--text-muted)] font-medium leading-relaxed">
              Comparing <span className="font-bold text-primary">{selectedVenues.length}</span> of 4 selected wedding venues
            </p>
          </div>
          
          <Button
            onClick={handleClearAll}
            variant="outline"
            size="sm"
            className="font-bold text-red-650 border-red-200 hover:bg-red-50/50"
            leftIcon={<Trash2 size={14} />}
          >
            Clear All
          </Button>
        </div>

        {/* Venue Cards Grid Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 select-none">
          {selectedVenues.map((venue) => (
            <Card
              key={venue._id}
              className="border border-[var(--border-medium)] relative hover:shadow-md transition-all duration-300"
            >
              <button
                onClick={() => handleRemoveVenue(venue._id)}
                className="absolute top-3 right-3 z-10 text-[var(--text-muted)] hover:text-red-600 transition-all p-1.5 bg-white/80 dark:bg-black/60 hover:bg-white dark:hover:bg-black rounded-full border border-stone-200/40 dark:border-stone-850 shadow-sm cursor-pointer"
                title="Remove from comparison"
                aria-label={`Remove ${venue.name} from comparison`}
              >
                <X size={15} />
              </button>

              <CardContent className="p-5 flex flex-col justify-between h-full min-h-[300px]">
                <div>
                  <div className="w-full h-40 bg-stone-100 dark:bg-stone-900/50 rounded-xl overflow-hidden mb-4 border border-[var(--border-light)]">
                    {venue.images && venue.images.length > 0 ? (
                      <img
                        src={getVenueCardImageUrl(venue.images[0].url)}
                        alt={venue.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={handleImageError}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] text-sm font-semibold select-none">
                        No image available
                      </div>
                    )}
                  </div>

                  <h3 className="font-serif font-bold text-base text-[var(--text-dark)] mb-2 line-clamp-2 leading-snug">
                    {venue.name}
                  </h3>

                  <div className="flex items-center gap-1.5 mb-2 text-xs font-bold text-[var(--text-dark)] select-none">
                    <Star className="fill-amber-400 text-amber-500" size={13} />
                    <span>{venue.rating.toFixed(1)} / 5.0</span>
                  </div>

                  <div className="text-xs text-[var(--text-muted)] font-semibold flex items-center gap-1.5 capitalize select-none">
                    <MapPin size={13} className="text-primary" />
                    <span>{venue.city}</span>
                  </div>
                </div>

                <Button
                  onClick={() => navigate(`/venues/${venue._id}`)}
                  variant="primary"
                  size="sm"
                  className="w-full mt-5 font-bold"
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Comparison Table */}
        <Card className="border border-[var(--border-medium)] overflow-hidden shadow-sm mb-8">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[800px] border-collapse text-sm">
              <tbody>
                
                {/* Venue Names */}
                <tr className="border-b border-[var(--border-light)] bg-stone-50 dark:bg-stone-900/40 select-none">
                  <td className="px-6 py-4 font-bold text-[var(--text-dark)] w-56 border-r border-[var(--border-light)]">
                    Venue
                  </td>
                  {selectedVenues.map((venue) => (
                    <td key={venue._id} className="px-6 py-4 font-serif font-extrabold text-sm text-[var(--text-dark)] text-center">
                      {venue.name}
                    </td>
                  ))}
                </tr>

                {/* Rating */}
                <tr className="border-b border-[var(--border-light)] hover:bg-stone-50/20 dark:hover:bg-stone-850/10 transition-colors select-none">
                  <td className="px-6 py-4 font-bold text-[var(--text-muted)] border-r border-[var(--border-light)]">
                    Rating
                  </td>
                  {selectedVenues.map((venue) => (
                    <td key={venue._id} className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[var(--text-dark)]">
                        <Star className="fill-amber-400 text-amber-500" size={13} />
                        <span>{venue.rating.toFixed(1)} / 5.0</span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* City */}
                <tr className="border-b border-[var(--border-light)] hover:bg-stone-50/20 dark:hover:bg-stone-850/10 transition-colors select-none">
                  <td className="px-6 py-4 font-bold text-[var(--text-muted)] border-r border-[var(--border-light)]">
                    City
                  </td>
                  {selectedVenues.map((venue) => (
                    <td key={venue._id} className="px-6 py-4 text-center capitalize font-semibold text-[var(--text-dark)]">
                      {venue.city}
                    </td>
                  ))}
                </tr>

                {/* Venue Type */}
                <tr className="border-b border-[var(--border-light)] hover:bg-stone-50/20 dark:hover:bg-stone-850/10 transition-colors select-none">
                  <td className="px-6 py-4 font-bold text-[var(--text-muted)] border-r border-[var(--border-light)]">
                    Venue Type
                  </td>
                  {selectedVenues.map((venue) => (
                    <td key={venue._id} className="px-6 py-4 text-center capitalize font-semibold text-[var(--text-dark)]">
                      {venue.venueType || venue.type || 'Venue'}
                    </td>
                  ))}
                </tr>

                {/* Capacity */}
                <tr className="border-b border-[var(--border-light)] hover:bg-stone-50/20 dark:hover:bg-stone-850/10 transition-colors select-none">
                  <td className="px-6 py-4 font-bold text-[var(--text-muted)] border-r border-[var(--border-light)]">
                    <div className="flex items-center gap-1.5">
                      <Users size={14} className="text-primary" />
                      <span>Capacity</span>
                    </div>
                  </td>
                  {selectedVenues.map((venue) => (
                    <td key={venue._id} className="px-6 py-4 text-center font-semibold text-[var(--text-dark)]">
                      {venue.capacity?.min || venue.capacity} - {venue.capacity?.max || venue.capacity} guests
                    </td>
                  ))}
                </tr>

                {/* Pricing */}
                <tr className="border-b border-[var(--border-light)] hover:bg-stone-50/20 dark:hover:bg-stone-850/10 transition-colors select-none">
                  <td className="px-6 py-4 font-bold text-[var(--text-muted)] border-r border-[var(--border-light)]">
                    <div className="flex items-center gap-1.5">
                      <Tag size={14} className="text-primary" />
                      <span>Pricing</span>
                    </div>
                  </td>
                  {selectedVenues.map((venue) => (
                    <td key={venue._id} className="px-6 py-4 text-center font-extrabold text-primary">
                      {venue.pricing?.perPlate ? (
                        <span>₹{venue.pricing.perPlate.toLocaleString('en-IN')}/plate</span>
                      ) : (
                        <span>₹{(venue.pricing?.flatRate || 0).toLocaleString('en-IN')} flat rate</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Setting */}
                <tr className="border-b border-[var(--border-light)] hover:bg-stone-50/20 dark:hover:bg-stone-850/10 transition-colors select-none">
                  <td className="px-6 py-4 font-bold text-[var(--text-muted)] border-r border-[var(--border-light)]">
                    Setting
                  </td>
                  {selectedVenues.map((venue) => (
                    <td key={venue._id} className="px-6 py-4 text-center font-semibold text-[var(--text-dark)]">
                      {venue.indoor && venue.outdoor
                        ? 'Indoor & Outdoor'
                        : venue.indoor
                        ? 'Indoor Only'
                        : 'Outdoor Only'}
                    </td>
                  ))}
                </tr>

                {/* Amenities */}
                <tr className="border-b border-[var(--border-light)] hover:bg-stone-50/20 dark:hover:bg-stone-850/10 transition-colors select-none">
                  <td className="px-6 py-4 font-bold text-[var(--text-muted)] border-r border-[var(--border-light)]">
                    Amenities
                  </td>
                  {selectedVenues.map((venue) => (
                    <td key={venue._id} className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 justify-center max-w-[250px] mx-auto select-none">
                        {venue.amenities.map((amenity) => (
                          <Badge
                            key={amenity}
                            variant="secondary"
                            className="text-[10px] py-0.5 px-2 font-bold capitalize whitespace-nowrap"
                          >
                            {amenity.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Address */}
                <tr className="border-b border-[var(--border-light)] hover:bg-stone-50/20 dark:hover:bg-stone-850/10 transition-colors">
                  <td className="px-6 py-4 font-bold text-[var(--text-muted)] border-r border-[var(--border-light)] select-none">
                    Address
                  </td>
                  {selectedVenues.map((venue) => (
                    <td key={venue._id} className="px-6 py-4 text-xs text-[var(--text-muted)] font-semibold text-center leading-relaxed max-w-[200px] select-text">
                      {venue.address}
                    </td>
                  ))}
                </tr>

                {/* Actions */}
                <tr className="select-none">
                  <td className="px-6 py-4 font-bold text-[var(--text-muted)] border-r border-[var(--border-light)]">
                    Actions
                  </td>
                  {selectedVenues.map((venue) => (
                    <td key={venue._id} className="px-6 py-4 text-center">
                      <Button
                        onClick={() => navigate(`/venues/${venue._id}`)}
                        variant="outline"
                        size="xs"
                        className="font-bold border-stone-200"
                      >
                        View Details
                      </Button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* Comparison Tips */}
        <Card className="border border-stone-200/50 dark:border-stone-850 bg-stone-50/50 dark:bg-stone-900/40 p-6 rounded-2xl select-none">
          <div className="flex gap-4 items-start">
            <div className="p-2 bg-primary/5 rounded-xl text-primary shrink-0">
              <HelpCircle size={20} />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[var(--text-dark)] mb-2">Comparison Tips</h3>
              <ul className="text-sm text-[var(--text-muted)] space-y-2 font-semibold">
                <li>♥ Compare capacity ranges and plate pricing to align with your guest count and budget constraints.</li>
                <li>♥ Check amenities profiles to verify critical vendor guidelines like AC, parking, and catering.</li>
                <li>♥ Review setting options (indoor halls vs. outdoor lawns) based on your season and decoration themes.</li>
                <li>♥ When ready, select "View Details" under any column to navigate to inquiry forms.</li>
              </ul>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}
