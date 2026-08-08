import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { removeFromCompare, clearCompare } from '../redux/compareSlice';
import { getVenueCardImageUrl, handleImageError } from '../utils/imageUtils';
import { Star, X, MapPin, Users, Tag, ArrowLeft, Trash2, HelpCircle } from 'lucide-react';

export default function CompareVenues() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedVenues } = useSelector((state) => state.compare);

  if (selectedVenues.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 text-[var(--text-body)]">
        <button
          onClick={() => navigate('/venues')}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#cf5577]"
        >
          <ArrowLeft size={17} />
          Back to Venues
        </button>

        <div className="text-center py-20 clay-card max-w-xl mx-auto p-8">
          <p className="text-[var(--text-muted)] text-lg mb-6">No venues selected for comparison</p>
          <button
            onClick={() => navigate('/venues')}
            className="rounded-lg bg-[#e86f8f] px-8 py-3 font-semibold text-white clay-button"
          >
            Browse Venues
          </button>
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
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 text-[var(--text-body)]">
      <button
        onClick={() => navigate('/venues')}
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#cf5577]"
      >
        <ArrowLeft size={17} />
        Back to Venues
      </button>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#cf5577]">Side by Side</p>
          <h1 className="mt-3 text-4xl font-extrabold leading-tight text-[var(--text-dark)] md:text-5xl">Compare Venues</h1>
          <p className="text-[var(--text-muted)] mt-2">
            {selectedVenues.length} / 4 venues selected for comparison
          </p>
        </div>
        <button
          onClick={handleClearAll}
          className="flex items-center gap-2 rounded-lg bg-white/70 px-5 py-3 text-red-600 font-semibold clay-button"
        >
          <Trash2 size={16} />
          Clear All
        </button>
      </div>

      {/* Venue Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {selectedVenues.map((venue) => (
          <div
            key={venue._id}
            className="clay-card p-5 relative flex flex-col justify-between"
          >
            <button
              onClick={() => handleRemoveVenue(venue._id)}
              className="absolute top-3 right-3 text-[var(--text-muted)] hover:text-red-500 transition p-1 bg-white/60 dark:bg-black/40 rounded-full"
              title="Remove from comparison"
            >
              <X size={18} />
            </button>

            <div>
              <div className="w-full h-40 bg-[var(--clay-inset-bg)] rounded-xl overflow-hidden mb-4 border border-[var(--border-light)]">
                {venue.images && venue.images.length > 0 ? (
                  <img
                    src={getVenueCardImageUrl(venue.images[0].url)}
                    alt={venue.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={handleImageError}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] text-sm">
                    No image available
                  </div>
                )}
              </div>

              <h3 className="font-bold text-lg text-[var(--text-dark)] mb-2 line-clamp-2">{venue.name}</h3>

              <div className="flex items-center gap-2 mb-2 text-sm text-[var(--text-muted)]">
                <Star className="fill-yellow-400 text-yellow-500" size={15} />
                <span className="font-semibold text-[var(--text-dark)]">{venue.rating.toFixed(1)}/5</span>
              </div>

              <div className="text-sm text-[var(--text-muted)] flex items-center gap-1.5 mb-2 capitalize">
                <MapPin size={14} />
                <span>{venue.city}</span>
              </div>
            </div>

            <button
              onClick={() => navigate(`/venues/${venue._id}`)}
              className="w-full mt-4 rounded-lg bg-[#e86f8f] hover:bg-[#cf5577] text-white text-sm font-bold py-2.5 px-4 transition clay-button"
            >
              View Details
            </button>
          </div>
        ))}
      </div>

      {/* Comparison Table */}
      <div className="clay-card overflow-hidden border border-[var(--border-light)] mb-10">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse">
            <tbody>
              {/* Venue Names */}
              <tr className="border-b border-[var(--border-light)]">
                <td className="px-6 py-4 font-bold text-[var(--text-dark)] bg-[var(--clay-inset-bg)] w-56 border-r border-[var(--border-light)]">
                  Venue
                </td>
                {selectedVenues.map((venue) => (
                  <td key={venue._id} className="px-6 py-5 font-bold text-[var(--text-dark)] text-center">
                    {venue.name}
                  </td>
                ))}
              </tr>

              {/* Rating */}
              <tr className="border-b border-[var(--border-light)] hover:bg-white/5 transition">
                <td className="px-6 py-4 font-semibold text-[var(--text-dark)] bg-[var(--clay-inset-bg)] border-r border-[var(--border-light)]">
                  Rating
                </td>
                {selectedVenues.map((venue) => (
                  <td key={venue._id} className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <Star className="fill-yellow-400 text-yellow-500" size={15} />
                      <span className="font-semibold text-[var(--text-dark)]">{venue.rating.toFixed(1)}/5</span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* City */}
              <tr className="border-b border-[var(--border-light)] hover:bg-white/5 transition">
                <td className="px-6 py-4 font-semibold text-[var(--text-dark)] bg-[var(--clay-inset-bg)] border-r border-[var(--border-light)]">
                  City
                </td>
                {selectedVenues.map((venue) => (
                  <td key={venue._id} className="px-6 py-4 text-center capitalize">
                    {venue.city}
                  </td>
                ))}
              </tr>

              {/* Venue Type */}
              <tr className="border-b border-[var(--border-light)] hover:bg-white/5 transition">
                <td className="px-6 py-4 font-semibold text-[var(--text-dark)] bg-[var(--clay-inset-bg)] border-r border-[var(--border-light)]">
                  Venue Type
                </td>
                {selectedVenues.map((venue) => (
                  <td key={venue._id} className="px-6 py-4 text-center capitalize font-medium">
                    {venue.venueType}
                  </td>
                ))}
              </tr>

              {/* Capacity */}
              <tr className="border-b border-[var(--border-light)] hover:bg-white/5 transition">
                <td className="px-6 py-4 font-semibold text-[var(--text-dark)] bg-[var(--clay-inset-bg)] border-r border-[var(--border-light)]">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-[#cf5577]" />
                    Capacity
                  </div>
                </td>
                {selectedVenues.map((venue) => (
                  <td key={venue._id} className="px-6 py-4 text-center font-medium">
                    {venue.capacity.min} - {venue.capacity.max} guests
                  </td>
                ))}
              </tr>

              {/* Pricing */}
              <tr className="border-b border-[var(--border-light)] hover:bg-white/5 transition">
                <td className="px-6 py-4 font-semibold text-[var(--text-dark)] bg-[var(--clay-inset-bg)] border-r border-[var(--border-light)]">
                  <div className="flex items-center gap-2">
                    <Tag size={16} className="text-[#cf5577]" />
                    Pricing
                  </div>
                </td>
                {selectedVenues.map((venue) => (
                  <td key={venue._id} className="px-6 py-4 text-center font-bold text-[#cf5577]">
                    {venue.pricing.perPlate ? (
                      <span>₹{venue.pricing.perPlate}/plate</span>
                    ) : (
                      <span>₹{venue.pricing.flatRate} flat rate</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Setting */}
              <tr className="border-b border-[var(--border-light)] hover:bg-white/5 transition">
                <td className="px-6 py-4 font-semibold text-[var(--text-dark)] bg-[var(--clay-inset-bg)] border-r border-[var(--border-light)]">
                  Setting
                </td>
                {selectedVenues.map((venue) => (
                  <td key={venue._id} className="px-6 py-4 text-center">
                    {venue.indoor && venue.outdoor
                      ? 'Indoor & Outdoor'
                      : venue.indoor
                      ? 'Indoor Only'
                      : 'Outdoor Only'}
                  </td>
                ))}
              </tr>

              {/* Amenities */}
              <tr className="border-b border-[var(--border-light)] hover:bg-white/5 transition">
                <td className="px-6 py-4 font-semibold text-[var(--text-dark)] bg-[var(--clay-inset-bg)] border-r border-[var(--border-light)]">
                  Amenities
                </td>
                {selectedVenues.map((venue) => (
                  <td key={venue._id} className="px-6 py-4">
                    <div className="flex flex-wrap gap-2 justify-center max-w-[250px] mx-auto">
                      {venue.amenities.map((amenity) => (
                        <span
                          key={amenity}
                          className="bg-[#ffd8c7] text-[#9f3f61] text-[11px] px-2.5 py-1 rounded-full font-semibold capitalize whitespace-nowrap"
                        >
                          {amenity.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Address */}
              <tr className="border-b border-[var(--border-light)] hover:bg-white/5 transition">
                <td className="px-6 py-4 font-semibold text-[var(--text-dark)] bg-[var(--clay-inset-bg)] border-r border-[var(--border-light)]">
                  Address
                </td>
                {selectedVenues.map((venue) => (
                  <td key={venue._id} className="px-6 py-4 text-sm text-[var(--text-muted)] text-center leading-relaxed">
                    {venue.address}
                  </td>
                ))}
              </tr>

              {/* Actions */}
              <tr>
                <td className="px-6 py-4 font-semibold text-[var(--text-dark)] bg-[var(--clay-inset-bg)] border-r border-[var(--border-light)]">
                  Actions
                </td>
                {selectedVenues.map((venue) => (
                  <td key={venue._id} className="px-6 py-4 text-center">
                    <button
                      onClick={() => navigate(`/venues/${venue._id}`)}
                      className="rounded-lg bg-[#e86f8f] hover:bg-[#cf5577] text-white text-xs font-bold py-2 px-4 transition clay-button"
                    >
                      View Details
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Comparison Tips */}
      <div className="bg-[#ffd8c7]/20 p-6 rounded-2xl border border-[#ffd8c7]/30 flex gap-4 items-start">
        <div className="p-2 bg-[#ffd8c7] rounded-lg text-[#9f3f61] shrink-0 mt-0.5">
          <HelpCircle size={20} />
        </div>
        <div>
          <h3 className="font-bold text-lg text-[var(--text-dark)] mb-2">Comparison Tips</h3>
          <ul className="text-[var(--text-body)] space-y-2 text-sm">
            <li>♥ Compare prices, capacity, and amenities to find the best fit for your wedding size.</li>
            <li>♥ Check star ratings and review details to gauge real couples' experiences.</li>
            <li>♥ Keep in mind setting preferences (indoor ballroom vs. outdoor lawns) when matching seasons.</li>
            <li>♥ Ready to lock down a selection? Click "View Details" to send a direct inquiry to the coordinator.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
