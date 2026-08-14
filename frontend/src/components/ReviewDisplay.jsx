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
import { Star, Trash2, ThumbsUp } from 'lucide-react';
import ReviewForm from './ReviewForm';
import Button from './ui/Button';
import { Card, CardContent } from './ui/Card';
import Badge from './ui/Badge';

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
  const { user } = useSelector((state) => state.auth || {});
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
    <div className="space-y-8 select-none">
      {/* User's Review Form (if not already reviewed) */}
      {!userReview && (
        <div className="border-t border-[var(--border-light)] pt-8">
          <ReviewForm venueId={venueId} />
        </div>
      )}

      {/* Reviews List */}
      <div>
        <h3 className="font-serif text-2xl font-bold mb-6 text-[var(--text-dark)]">
          Reviews ({total})
        </h3>

        {reviews.length === 0 ? (
          <p className="text-[var(--text-muted)] font-medium text-center py-8">
            No reviews yet. Be the first to review!
          </p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card 
                key={review._id}
                className="hover:border-primary/20 transition-colors duration-200"
              >
                <CardContent className="p-6">
                  {/* Review Header */}
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={
                                i < review.rating
                                  ? 'text-amber-500 fill-amber-500'
                                  : 'text-stone-300 dark:text-stone-700'
                              }
                            />
                          ))}
                        </div>
                        <span className="text-xs font-bold text-[var(--text-muted)] select-none">
                          {review.rating.toFixed(1)} / 5.0
                        </span>
                        {review.isVerified && (
                          <Badge variant="success" className="text-[10px] tracking-normal px-2.5 py-0">
                            Verified Couple
                          </Badge>
                        )}
                      </div>
                      <h4 className="text-lg font-bold text-[var(--text-dark)] leading-tight">
                        {review.title}
                      </h4>
                    </div>

                    {/* Actions */}
                    {user?._id === review.customer?._id && (
                      <div className="flex gap-1.5 shrink-0 select-none">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingReviewId(review._id)}
                          className="py-1 px-2.5 text-xs text-primary font-bold hover:bg-primary/5"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm(review._id)}
                          className="py-1 px-2.5 text-xs text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-950/20"
                        >
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Review Edit Form */}
                  {editingReviewId === review._id && (
                    <div className="mb-4 p-4 bg-stone-50 dark:bg-stone-900 border border-stone-250/50 dark:border-stone-800 rounded-xl">
                      <ReviewForm
                        venueId={venueId}
                        existingReview={review}
                        onSuccess={() => setEditingReviewId(null)}
                      />
                    </div>
                  )}

                  {/* Delete Confirmation */}
                  {deleteConfirm === review._id && (
                    <div className="mb-4 p-4 bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30 rounded-xl flex flex-col gap-3">
                      <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                        Are you sure you want to delete this review?
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteReview(review._id)}
                          className="py-1.5 px-4 font-bold"
                        >
                          Delete
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteConfirm(null)}
                          className="py-1.5 px-4 font-bold border-stone-300 hover:bg-stone-100"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Review Content */}
                  {editingReviewId !== review._id && (
                    <>
                      <div className="mb-5 select-text">
                        <p className="text-sm text-[var(--text-body)] leading-relaxed">{review.comment}</p>
                      </div>

                      {/* Review Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-[var(--border-light)] mt-4">
                        <div className="text-xs text-[var(--text-muted)] font-semibold leading-normal">
                          <p className="font-bold text-[var(--text-dark)]">{review.customer?.name}</p>
                          <p className="mt-0.5">
                            {new Date(review.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                        </div>

                        <div>
                          <button
                            onClick={() => handleMarkHelpful(review._id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[var(--text-muted)] hover:text-primary hover:bg-primary/5 rounded-lg border border-transparent hover:border-primary/10 transition duration-150 cursor-pointer"
                          >
                            <ThumbsUp size={13} />
                            <span>Helpful ({review.helpful})</span>
                          </button>
                        </div>
                      </div>

                      {/* Organizer Reply */}
                      {review.organizerReply?.comment && (
                        <div className="mt-4 p-4 bg-primary/5 rounded-xl border-l-4 border-primary">
                          <p className="text-xs font-bold text-primary mb-1 select-none">
                            Coordinator Response
                          </p>
                          <p className="text-sm text-[var(--text-body)] leading-relaxed select-text mb-1">
                            {review.organizerReply.comment}
                          </p>
                          <p className="text-[10px] text-[var(--text-muted)] font-semibold">
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
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[var(--border-light)] pt-6 select-none">
            <p className="text-xs font-semibold text-[var(--text-muted)]">
              Showing <span className="font-bold text-[var(--text-dark)]">{(currentPage - 1) * 10 + 1}</span> to{' '}
              <span className="font-bold text-[var(--text-dark)]">{Math.min(currentPage * 10, total)}</span> of{' '}
              <span className="font-bold text-[var(--text-dark)]">{total}</span> reviews
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange && onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="py-2 px-3 font-bold border-stone-200 dark:border-stone-850"
              >
                Previous
              </Button>
              <span className="flex items-center text-xs font-bold text-[var(--text-dark)] px-2">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange && onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="py-2 px-3 font-bold border-stone-200 dark:border-stone-850"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
