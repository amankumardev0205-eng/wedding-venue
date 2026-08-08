import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchVenuesStart,
  fetchVenuesSuccess,
  fetchVenuesFailure,
  removeVenueStart,
  removeVenueSuccess,
  removeVenueFailure,
  clearError,
} from '../redux/adminSlice';
import { adminAPI } from '../utils/api';
import { FaSearch, FaTrash } from 'react-icons/fa';

export default function VenueModeration() {
  const dispatch = useDispatch();
  const { venues, isLoading, error, currentPage, totalPages, total } = useSelector(
    (state) => state.admin
  );
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchVenues();
  }, [search, page]);

  const fetchVenues = async () => {
    dispatch(fetchVenuesStart());
    try {
      const response = await adminAPI.getAllVenues({
        page,
        limit: 10,
        search,
      });
      dispatch(fetchVenuesSuccess(response.data));
    } catch (err) {
      dispatch(
        fetchVenuesFailure(err.response?.data?.message || 'Failed to fetch venues')
      );
    }
  };

  const handleRemoveVenue = async (venueId) => {
    dispatch(removeVenueStart());
    try {
      await adminAPI.removeVenue(venueId);
      dispatch(removeVenueSuccess(venueId));
      setDeleteConfirm(null);
    } catch (err) {
      dispatch(
        removeVenueFailure(
          err.response?.data?.message || 'Failed to remove venue'
        )
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="relative">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search venues by name or city..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded text-red-700">
          {error}
          <button
            onClick={() => dispatch(clearError())}
            className="ml-4 text-red-900 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Venues Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-600">Loading venues...</div>
        ) : venues.length === 0 ? (
          <div className="p-8 text-center text-gray-600">No venues found</div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Venue Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Organizer
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    City
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {venues.map((venue) => (
                  <tr key={venue._id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {venue.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {venue.organizer?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                      {venue.city}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="text-yellow-600 font-semibold">
                        {venue.rating.toFixed(1)} ★
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(venue.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {deleteConfirm === venue._id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRemoveVenue(venue._id)}
                            className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-xs hover:bg-gray-400"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(venue._id)}
                          className="text-red-600 hover:text-red-700 font-semibold flex items-center gap-1"
                        >
                          <FaTrash size={14} />
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, total)} of {total}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="flex items-center px-4">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
