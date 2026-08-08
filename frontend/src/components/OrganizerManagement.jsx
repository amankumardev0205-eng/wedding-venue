import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchOrganizersStart,
  fetchOrganizersSuccess,
  fetchOrganizersFailure,
  clearError,
} from '../redux/adminSlice';
import { adminAPI } from '../utils/api';
import { FaSearch } from 'react-icons/fa';

export default function OrganizerManagement() {
  const dispatch = useDispatch();
  const { organizers, isLoading, error, currentPage, totalPages, total } = useSelector(
    (state) => state.admin
  );
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchOrganizers();
  }, [search, page]);

  const fetchOrganizers = async () => {
    dispatch(fetchOrganizersStart());
    try {
      const response = await adminAPI.getAllOrganizers({
        page,
        limit: 10,
        search,
      });
      dispatch(fetchOrganizersSuccess(response.data));
    } catch (err) {
      dispatch(
        fetchOrganizersFailure(
          err.response?.data?.message || 'Failed to fetch organizers'
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
            placeholder="Search organizers by name or email..."
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

      {/* Organizers Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-600">Loading organizers...</div>
        ) : organizers.length === 0 ? (
          <div className="p-8 text-center text-gray-600">No organizers found</div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {organizers.map((org) => (
                  <tr key={org._id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {org.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{org.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(org.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                        Active
                      </span>
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
