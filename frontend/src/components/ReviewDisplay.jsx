import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { reviewAPI } from '../utils/api';
import {
  deleteReviewStart,
  deleteReviewSuccess,
  deleteReviewFailure,
  markHelpfulStart,
  markHelpfulSuccess,
  markHelpfulFailure,
} from '../redux/reviewSlice';
import { FaStar, FaTrash, FaThumbsUp } from 'react-icons/fa';
import ReviewForm from './ReviewForm';

export default function ReviewDisplay({
  reviews = [],
  venueId,
  onReviewDeleted,
  currentPage = 1,
  totalPages = 1,
  total = 0,
  onPageChange,
}) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleDeleteReview = async (reviewId) => {
    dispatch(deleteReviewStart());
    try {
      await reviewAPI.deleteReview(reviewId);
      dispatch(deleteReviewSuccess(reviewId));
      setDeleteConfirm(null);
      if (onReviewDeleted) onReviewDeleted();
    } catch (err) {
      dispatch(
        deleteReviewFailure(
          err.response?.data?.message || 'Failed to delete review'
        )
      );
    }
  };

  const handleMarkHelpful = async (reviewId) => {
    dispatch(markHelpfulStart());
    try {
      const response = await reviewAPI.markHelpful(reviewId);
      dispatch(markHelpfulSuccess(response.data.review));
    } catch (err) {
      dispatch(
        markHelpfulFailure(
          err.response?.data?.message || 'Failed to mark as helpful'
        )
      );
    }
  };

  const userReview = reviews.find((r) => r.customer?._id === user?._id);

  return (
    <div className="space-y-8">
      {/* User's Review Form (if not already reviewed) */}
      {!userReview && (
        <div>
          <ReviewForm venueId={venueId} />
        </div>
      )}

      {/* Reviews List */}
      <div>
        <h3 className="text-2xl font-bold mb-6">Reviews ({total})</h3>

        {reviews.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No reviews yet. Be the first to review!</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review._id}
                className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition"
              >
                {/* Review Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            size={16}
                            className={
                              i < review.rating
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            }
                          />
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-gray-600">
                        {review.rating} out of 5
                      </span>
                      {review.isVerified && (
                        <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {review.title}
                    </h4>
                  </div>

                  {/* Actions */}
                  {user?._id === review.customer?._id && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingReviewId(review._id)}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(review._id)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                {/* Review Edit Form */}
                {editingReviewId === review._id && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <ReviewForm
                      venueId={venueId}
                      existingReview={review}
                      onSuccess={() => setEditingReviewId(null)}
                    />
                  </div>
                )}

                {/* Delete Confirmation */}
                {deleteConfirm === review._id && (
                  <div className="mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-red-700 mb-3">Are you sure you want to delete this review?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDeleteReview(review._id)}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Review Content */}
                {editingReviewId !== review._id && (
                  <>
                    <div className="mb-4">
                      <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                    </div>

                    {/* Review Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="text-sm text-gray-600">
                        <p className="font-semibold">{review.customer?.name}</p>
                        <p>
                          {new Date(review.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleMarkHelpful(review._id)}
                          className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                        >
                          <FaThumbsUp size={14} />
                          <span>Helpful ({review.helpful})</span>
                        </button>
                      </div>
                    </div>

                    {/* Organizer Reply */}
                    {review.organizerReply?.comment && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                        <p className="text-sm font-semibold text-blue-900 mb-2">
                          Organizer Reply
                        </p>
                        <p className="text-gray-700 text-sm mb-2">
                          {review.organizerReply.comment}
                        </p>
                        <p className="text-xs text-gray-600">
                          {new Date(
                            review.organizerReply.repliedAt
                          ).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 pt-6">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold">{(currentPage - 1) * 10 + 1}</span> to{' '}
              <span className="font-semibold">{Math.min(currentPage * 10, total)}</span> of{' '}
              <span className="font-semibold">{total}</span> reviews
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => onPageChange && onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 transition text-sm font-medium"
              >
                Previous
              </button>
              <span className="flex items-center text-sm font-medium text-gray-600 px-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => onPageChange && onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 transition text-sm font-medium"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
