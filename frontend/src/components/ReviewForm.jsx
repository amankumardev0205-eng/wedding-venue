import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { reviewAPI } from '../utils/api';
import {
  createReviewStart,
  createReviewSuccess,
  createReviewFailure,
  updateReviewStart,
  updateReviewSuccess,
  updateReviewFailure,
  clearError,
} from '../redux/reviewSlice';
import { FaStar } from 'react-icons/fa';

export default function ReviewForm({ venueId, onSuccess, existingReview = null }) {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.reviews);
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    rating: existingReview?.rating || 5,
    title: existingReview?.title || '',
    comment: existingReview?.comment || '',
  });

  const [hoverRating, setHoverRating] = useState(0);
  const [validationErrors, setValidationErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Review title is required';
    if (formData.title.length > 100) errors.title = 'Title must be 100 characters or less';
    if (!formData.comment.trim()) errors.comment = 'Review comment is required';
    if (formData.comment.length > 1000) errors.comment = 'Comment must be 1000 characters or less';
    if (!formData.rating || formData.rating < 1 || formData.rating > 5) {
      errors.rating = 'Rating must be between 1 and 5';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    if (existingReview) {
      // Update review
      dispatch(updateReviewStart());
      try {
        const response = await reviewAPI.updateReview(existingReview._id, formData);
        dispatch(updateReviewSuccess(response.data.review));
        setFormData({ rating: 5, title: '', comment: '' });
        setValidationErrors({});
        if (onSuccess) onSuccess();
      } catch (err) {
        dispatch(
          updateReviewFailure(
            err.response?.data?.message || 'Failed to update review'
          )
        );
      }
    } else {
      // Create new review
      dispatch(createReviewStart());
      try {
        const response = await reviewAPI.createReview({
          venueId,
          ...formData,
        });
        dispatch(createReviewSuccess(response.data.review));
        setFormData({ rating: 5, title: '', comment: '' });
        setValidationErrors({});
        if (onSuccess) onSuccess();
      } catch (err) {
        dispatch(
          createReviewFailure(
            err.response?.data?.message || 'Failed to create review'
          )
        );
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  if (!user) {
    return (
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <p className="text-gray-700">
          Please{' '}
          <a href="/login" className="text-blue-600 hover:underline font-semibold">
            log in
          </a>
          {' '}to write a review.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-xl font-bold mb-4">
        {existingReview ? 'Edit your review' : 'Write a review'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating */}
        <div>
          <label className="block text-sm font-semibold mb-2">Rating</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => {
                  setFormData({ ...formData, rating: star });
                  setValidationErrors({ ...validationErrors, rating: '' });
                }}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="focus:outline-none transition"
              >
                <FaStar
                  size={28}
                  className={
                    star <= (hoverRating || formData.rating)
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }
                />
              </button>
            ))}
          </div>
          {validationErrors.rating && (
            <p className="text-red-600 text-sm mt-1">{validationErrors.rating}</p>
          )}
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-semibold mb-2">
            Review Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Amazing venue for our wedding"
            maxLength="100"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              validationErrors.title ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          <div className="flex justify-between mt-1">
            <span>
              {validationErrors.title && (
                <p className="text-red-600 text-sm">{validationErrors.title}</p>
              )}
            </span>
            <span className="text-gray-600 text-xs">{formData.title.length}/100</span>
          </div>
        </div>

        {/* Comment */}
        <div>
          <label htmlFor="comment" className="block text-sm font-semibold mb-2">
            Your Review
          </label>
          <textarea
            id="comment"
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            placeholder="Share your experience with this venue..."
            maxLength="1000"
            rows="4"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
              validationErrors.comment ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          <div className="flex justify-between mt-1">
            <span>
              {validationErrors.comment && (
                <p className="text-red-600 text-sm">{validationErrors.comment}</p>
              )}
            </span>
            <span className="text-gray-600 text-xs">
              {formData.comment.length}/1000
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 p-3 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 font-semibold"
        >
          {isLoading
            ? 'Submitting...'
            : existingReview
            ? 'Update Review'
            : 'Submit Review'}
        </button>
      </form>
    </div>
  );
}
