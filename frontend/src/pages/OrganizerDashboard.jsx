import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';

import { getVenueCardImageUrl, handleImageError } from '../utils/imageUtils';
import { motion, AnimatePresence } from 'framer-motion';
import VenueCardSkeleton from '../components/VenueCardSkeleton';
import {
  fetchOrganizerVenues,
  createNewVenue,
  updateExistingVenue,
  removeVenue,
  clearMessages,
} from '../redux/organizerVenuesSlice';
import VenueForm from '../components/VenueForm';

export default function OrganizerDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { venues, loading, error, successMessage } = useSelector((state) => state.organizerVenues);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'Organizer') {
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
    <div className="min-h-screen bg-gray-50">
      <motion.div 
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="py-8"
      >
        <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Organizer Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your wedding venues</p>
          </div>
          <button
            onClick={() => {
              setEditingVenue(null);
              setShowForm(!showForm);
            }}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 active:scale-95 transition-all shadow-sm"
          >
            <FiPlus /> {showForm && !editingVenue ? 'Close' : 'Add Venue'}
          </button>
        </div>

        {/* Messages */}
        <AnimatePresence>
          {successMessage && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
              {successMessage}
            </motion.div>
          )}
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Section */}
        <AnimatePresence>
          {showForm && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              exit={{ opacity: 0, height: 0 }} 
              className="mb-8 overflow-hidden"
            >
            <VenueForm
              onSubmit={handleAddVenue}
              isLoading={loading}
              initialData={editingVenue}
              isEditing={!!editingVenue}
            />
            <div className="mt-4 text-center">
              <button
                onClick={handleCloseForm}
                className="px-6 py-2 text-gray-600 hover:text-gray-900 font-medium active:scale-95 transition-all"
              >
                Cancel
              </button>
            </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Venues List */}
        <div>
          {loading && venues.length === 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {[1, 2, 3].map((n) => (
                 <VenueCardSkeleton key={n} />
               ))}
             </div>
          ) : venues.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 px-6 clay-card flex flex-col items-center justify-center border border-[var(--border-light)] rounded-2xl shadow-sm bg-white dark:bg-[#211C1F]"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 mb-5 shadow-sm text-[#E85D83] dark:text-[#F06D91]">
                <FiPlus size={32} />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-dark)] mb-2">No Venues Yet</h3>
              <p className="max-w-md text-sm text-[var(--text-muted)] mb-6 leading-relaxed">
                Get started by creating your first professional wedding venue listing.
              </p>
              <button
                onClick={() => {
                  setEditingVenue(null);
                  setShowForm(true);
                }}
                className="rounded-xl bg-[#E85D83] hover:bg-[#C43C62] dark:bg-[#F06D91] dark:hover:bg-[#E85D83] px-6 py-2.5 text-xs font-bold text-white transition hover:-translate-y-[1px] shadow-sm cursor-pointer inline-flex items-center gap-2"
              >
                <FiPlus size={16} />
                <span>Add Your First Venue</span>
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {venues.map((venue) => (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={venue._id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-300"
                >
                  {/* Venue Image */}
                  {venue.images && venue.images.length > 0 ? (
                    <img
                      src={getVenueCardImageUrl(venue.images[0].url)}
                      alt={venue.name}
                      className="w-full h-48 object-cover"
                      loading="lazy"
                      onError={handleImageError}
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">No image</span>
                    </div>
                  )}

                  {/* Venue Info */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900">{venue.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{venue.city}</p>

                    <div className="space-y-2 mb-4">
                      <p className="text-sm">
                        <span className="font-semibold">Type:</span> {venue.type}
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">Capacity:</span> {venue.capacity} guests
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">Base Price:</span> ₹{venue.pricing?.base}/person
                      </p>
                    </div>

                    {/* Amenities */}
                    {venue.amenities && venue.amenities.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-semibold mb-2">Amenities:</p>
                        <div className="flex flex-wrap gap-1">
                          {venue.amenities.slice(0, 3).map((amenity, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                            >
                              {amenity}
                            </span>
                          ))}
                          {venue.amenities.length > 3 && (
                            <span className="text-xs text-gray-600 px-2 py-1">
                              +{venue.amenities.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 border-t pt-4">
                      <button
                        onClick={() => handleEditVenue(venue)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition"
                      >
                        <FiEdit2 size={16} /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteVenue(venue._id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition"
                      >
                        <FiTrash2 size={16} /> Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      </motion.div>
    </div>
  );
}
