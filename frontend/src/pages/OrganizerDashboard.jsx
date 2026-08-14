import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Edit2, Trash2, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { getVenueCardImageUrl, handleImageError } from '../utils/imageUtils';
import VenueCardSkeleton from '../components/VenueCardSkeleton';
import {
  fetchOrganizerVenues,
  createNewVenue,
  updateExistingVenue,
  removeVenue,
  clearMessages,
} from '../redux/organizerVenuesSlice';
import VenueForm from '../components/VenueForm';

// UI components
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';

export default function OrganizerDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);
  const { user, isAuthenticated } = useSelector((state) => state.auth || {});
  const { venues, loading, error, successMessage } = useSelector((state) => state.organizerVenues || { venues: [], loading: false, error: null, successMessage: null });

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'organizer') {
      navigate('/login');
      return;
    }

    dispatch(fetchOrganizerVenues());
  }, [isAuthenticated, user, dispatch, navigate]);

  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        dispatch(clearMessages());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error, dispatch]);

  const handleAddVenue = (formData) => {
    if (editingVenue) {
      dispatch(updateExistingVenue({ venueId: editingVenue._id, formData })).then((result) => {
        if (result.type === 'organizerVenues/updateVenue/fulfilled') {
          setShowForm(false);
          setEditingVenue(null);
        }
      });
    } else {
      dispatch(createNewVenue(formData)).then((result) => {
        if (result.type === 'organizerVenues/createVenue/fulfilled') {
          setShowForm(false);
          setEditingVenue(null);
        }
      });
    }
  };

  const handleEditVenue = (venue) => {
    setEditingVenue(venue);
    setShowForm(true);
  };

  const handleDeleteVenue = (venueId) => {
    if (window.confirm('Are you sure you want to delete this venue?')) {
      dispatch(removeVenue(venueId));
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingVenue(null);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen text-[var(--text-body)] pt-8 pb-16 bg-[var(--bg-slate)] transition-colors duration-300">
      <motion.div 
        initial={{ opacity: 0, y: 12 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="max-w-6xl mx-auto px-6"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 select-none">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Coordinator Center</span>
            <h1 className="font-serif text-3xl md:text-5xl font-extrabold text-[var(--text-dark)] leading-tight tracking-wide">
              Organizer Dashboard
            </h1>
            <p className="text-sm text-[var(--text-muted)] font-medium leading-relaxed max-w-[500px]">
              Manage and list your professional wedding venue portfolios.
            </p>
          </div>
          
          <Button
            onClick={() => {
              setEditingVenue(null);
              setShowForm(!showForm);
            }}
            variant={showForm && !editingVenue ? 'outline' : 'primary'}
            className="font-bold shrink-0 shadow-sm"
            leftIcon={!(showForm && !editingVenue) && <Plus size={16} />}
          >
            {showForm && !editingVenue ? 'Close Panel' : 'Add Venue'}
          </Button>
        </div>

        {/* Notifications */}
        <AnimatePresence>
          {successMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0 }} 
              className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-semibold select-text"
            >
              {successMessage}
            </motion.div>
          )}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0 }} 
              className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-semibold select-text"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Venue Form Overlay panel */}
        <AnimatePresence>
          {showForm && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              exit={{ opacity: 0, height: 0 }} 
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="mb-8 overflow-hidden"
            >
              <VenueForm
                onSubmit={handleAddVenue}
                isLoading={loading}
                initialData={editingVenue}
                isEditing={!!editingVenue}
              />
              <div className="mt-4 text-center select-none">
                <Button
                  onClick={handleCloseForm}
                  variant="ghost"
                  className="font-bold text-stone-500 hover:text-stone-700"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Venues grid section */}
        <div>
          {loading && venues.length === 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {[1, 2, 3].map((n) => (
                 <VenueCardSkeleton key={n} />
               ))}
             </div>
          ) : venues.length === 0 ? (
            <EmptyState
              title="No venues yet"
              description="Get started by creating your first professional wedding venue listing to manage bookings."
              action={
                <Button
                  onClick={() => {
                    setEditingVenue(null);
                    setShowForm(true);
                  }}
                  variant="primary"
                  className="font-bold shadow-sm"
                  leftIcon={<Plus size={15} />}
                >
                  Add Your First Venue
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {venues.map((venue) => (
                <Card 
                  key={venue._id}
                  className="border border-[var(--border-medium)] overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-300"
                >
                  {/* Venue Image */}
                  <div className="relative h-48 w-full bg-stone-100 dark:bg-stone-900/50 overflow-hidden shrink-0 select-none border-b border-[var(--border-light)]">
                    {venue.images && venue.images.length > 0 ? (
                      <img
                        src={getVenueCardImageUrl(venue.images[0].url)}
                        alt={venue.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={handleImageError}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[var(--text-muted)] text-sm font-semibold select-none">
                        No image available
                      </div>
                    )}
                  </div>

                  {/* Venue details Info */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div className="flex-grow flex flex-col justify-start">
                      <h3 className="font-serif text-lg font-bold text-[var(--text-dark)] leading-snug truncate" title={venue.name}>
                        {venue.name}
                      </h3>
                      <p className="text-xs text-[var(--text-muted)] font-semibold capitalize mb-4 select-none">{venue.city}</p>

                      <div className="space-y-2 mb-4 text-xs font-semibold text-[var(--text-muted)] select-none">
                        <p className="flex justify-between border-b border-[var(--border-light)] pb-1.5">
                          <span>Setting Type</span> 
                          <span className="text-[var(--text-dark)] capitalize">{venue.type || venue.venueType || 'Venue'}</span>
                        </p>
                        <p className="flex justify-between border-b border-[var(--border-light)] pb-1.5">
                          <span>Capacity</span> 
                          <span className="text-[var(--text-dark)]">{venue.capacity} guests</span>
                        </p>
                        <p className="flex justify-between border-b border-[var(--border-light)] pb-1.5">
                          <span>Base Price</span> 
                          <span className="text-[var(--text-dark)]">₹{(venue.pricing?.base || 0).toLocaleString('en-IN')}/person</span>
                        </p>
                      </div>

                      {/* Amenities */}
                      {venue.amenities && venue.amenities.length > 0 && (
                        <div className="mb-4 select-none">
                          <p className="text-xs text-[var(--text-muted)] font-semibold mb-2">Amenities</p>
                          <div className="flex flex-wrap gap-1">
                            {venue.amenities.slice(0, 3).map((amenity, idx) => (
                              <Badge key={idx} variant="secondary" className="capitalize text-[10px] py-0.5 px-2 font-bold tracking-normal">
                                {amenity}
                              </Badge>
                            ))}
                            {venue.amenities.length > 3 && (
                              <span className="text-[10px] text-[var(--text-muted)] font-semibold flex items-center">
                                +{venue.amenities.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 border-t border-[var(--border-light)] pt-4 mt-4 select-none">
                      <Button
                        onClick={() => handleEditVenue(venue)}
                        variant="outline"
                        size="sm"
                        className="flex-1 font-bold gap-1.5"
                        leftIcon={<Edit2 size={13} />}
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDeleteVenue(venue._id)}
                        variant="outline"
                        size="sm"
                        className="flex-1 font-bold gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
                        leftIcon={<Trash2 size={13} />}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
