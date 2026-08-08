import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchReviewsStart,
  fetchReviewsSuccess,
  fetchReviewsFailure,
  removeReviewStart,
  removeReviewSuccess,
  removeReviewFailure,
  clearError,
} from '../redux/adminSlice';
import { adminAPI } from '../utils/api';
import { FaSearch, FaTrash, FaStar } from 'react-icons/fa';

export default function ReviewModeration() {
  const dispatch = useDispatch();
  const { reviews, isLoading, error, currentPage, totalPages, total } = useSelector(
    (state) => state.admin
  );
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, [search, page]);

  const fetchReviews = async () => {
    dispatch(fetchReviewsStart());
    try {
      const response = await adminAPI.getAllReviews({
        page,
        limit: 10,
        search,
      });
      dispatch(fetchReviewsSuccess(response.data));
    } catch (err) {
      dispatch(
        fetchReviewsFailure(err.response?.data?.message || 'Failed to fetch reviews')
      );
    }
  };

  const handleRemoveReview = async (reviewId) => {
    dispatch(removeReviewStart());
    try {
      await adminAPI.removeReview(reviewId);
      dispatch(removeReviewSuccess(reviewId));
      setDeleteConfirm(null);
    } catch (err) {
      dispatch(
        removeReviewFailure(
          err.response?.data?.message || 'Failed to remove review'
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
            placeholder="Search reviews by title or content..."
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

      {/* Reviews Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-600">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="p-8 text-center text-gray-600">No reviews found</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Venue
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Customer
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
                  {reviews.map((review) => (
                    <tr key={review._id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-xs truncate">
                        {review.title}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {review.venue?.name || 'Deleted'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {review.customer?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-1">
                          <FaStar className="text-yellow-400" size={14} />
                          <span className="font-semibold">{review.rating}/5</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {deleteConfirm === review._id ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleRemoveReview(review._id)}
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
                            onClick={() => setDeleteConfirm(review._id)}
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
            </div>

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
