import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  reviews: [],
  currentReview: null,
  isLoading: false,
  error: null,
  totalPages: 1,
  currentPage: 1,
  total: 0,
};

const reviewSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    // Fetch reviews
    getReviewsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    getReviewsSuccess: (state, action) => {
      state.isLoading = false;
      state.reviews = action.payload.reviews;
      state.totalPages = action.payload.totalPages;
      state.currentPage = action.payload.currentPage;
      state.total = action.payload.total;
    },
    getReviewsFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Create review
    createReviewStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    createReviewSuccess: (state, action) => {
      state.isLoading = false;
      state.reviews.unshift(action.payload);
      state.total += 1;
    },
    createReviewFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Update review
    updateReviewStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    updateReviewSuccess: (state, action) => {
      state.isLoading = false;
      const index = state.reviews.findIndex((r) => r._id === action.payload._id);
      if (index !== -1) {
        state.reviews[index] = action.payload;
      }
    },
    updateReviewFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Delete review
    deleteReviewStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    deleteReviewSuccess: (state, action) => {
      state.isLoading = false;
      state.reviews = state.reviews.filter((r) => r._id !== action.payload);
      state.total -= 1;
    },
    deleteReviewFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Mark helpful
    markHelpfulStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    markHelpfulSuccess: (state, action) => {
      state.isLoading = false;
      const review = state.reviews.find((r) => r._id === action.payload._id);
      if (review) {
        review.helpful = action.payload.helpful;
      }
    },
    markHelpfulFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Reset state
    clearError: (state) => {
      state.error = null;
    },
    resetReviews: (state) => {
      return initialState;
    },
  },
});

export const {
  getReviewsStart,
  getReviewsSuccess,
  getReviewsFailure,
  createReviewStart,
  createReviewSuccess,
  createReviewFailure,
  updateReviewStart,
  updateReviewSuccess,
  updateReviewFailure,
  deleteReviewStart,
  deleteReviewSuccess,
  deleteReviewFailure,
  markHelpfulStart,
  markHelpfulSuccess,
  markHelpfulFailure,
  clearError,
  resetReviews,
} = reviewSlice.actions;

export default reviewSlice.reducer;
