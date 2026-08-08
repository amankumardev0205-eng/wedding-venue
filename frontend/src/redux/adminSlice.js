import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  users: [],
  organizers: [],
  venues: [],
  reviews: [],
  analytics: null,
  isLoading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  total: 0,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    // Fetch users
    fetchUsersStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchUsersSuccess: (state, action) => {
      state.isLoading = false;
      state.users = action.payload.users;
      state.totalPages = action.payload.totalPages;
      state.currentPage = action.payload.currentPage;
      state.total = action.payload.total;
    },
    fetchUsersFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Fetch organizers
    fetchOrganizersStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchOrganizersSuccess: (state, action) => {
      state.isLoading = false;
      state.organizers = action.payload.organizers;
      state.totalPages = action.payload.totalPages;
      state.currentPage = action.payload.currentPage;
      state.total = action.payload.total;
    },
    fetchOrganizersFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Fetch venues
    fetchVenuesStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchVenuesSuccess: (state, action) => {
      state.isLoading = false;
      state.venues = action.payload.venues;
      state.totalPages = action.payload.totalPages;
      state.currentPage = action.payload.currentPage;
      state.total = action.payload.total;
    },
    fetchVenuesFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Remove venue
    removeVenueStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    removeVenueSuccess: (state, action) => {
      state.isLoading = false;
      state.venues = state.venues.filter((v) => v._id !== action.payload);
      state.total -= 1;
    },
    removeVenueFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Fetch reviews
    fetchReviewsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchReviewsSuccess: (state, action) => {
      state.isLoading = false;
      state.reviews = action.payload.reviews;
      state.totalPages = action.payload.totalPages;
      state.currentPage = action.payload.currentPage;
      state.total = action.payload.total;
    },
    fetchReviewsFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Remove review
    removeReviewStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    removeReviewSuccess: (state, action) => {
      state.isLoading = false;
      state.reviews = state.reviews.filter((r) => r._id !== action.payload);
      state.total -= 1;
    },
    removeReviewFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Fetch analytics
    fetchAnalyticsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchAnalyticsSuccess: (state, action) => {
      state.isLoading = false;
      state.analytics = action.payload;
    },
    fetchAnalyticsFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchUsersStart,
  fetchUsersSuccess,
  fetchUsersFailure,
  fetchOrganizersStart,
  fetchOrganizersSuccess,
  fetchOrganizersFailure,
  fetchVenuesStart,
  fetchVenuesSuccess,
  fetchVenuesFailure,
  removeVenueStart,
  removeVenueSuccess,
  removeVenueFailure,
  fetchReviewsStart,
  fetchReviewsSuccess,
  fetchReviewsFailure,
  removeReviewStart,
  removeReviewSuccess,
  removeReviewFailure,
  fetchAnalyticsStart,
  fetchAnalyticsSuccess,
  fetchAnalyticsFailure,
  clearError,
} = adminSlice.actions;

export default adminSlice.reducer;
