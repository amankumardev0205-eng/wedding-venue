import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  venues: [],
  selectedVenue: null,
  isLoading: false,
  error: null,
  filters: {
    state: '',
    city: '',
    search: '',
    venueType: '',
    minPrice: '',
    maxPrice: '',
    minCapacity: '',
    maxCapacity: '',
    amenities: [],
    minRating: '',
    indoor: '',
    outdoor: '',
    sort: '',
    lat: '',
    lng: '',
    radiusKm: '',
  },
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
  },
};

const venueSlice = createSlice({
  name: 'venues',
  initialState,
  reducers: {
    // Get venues
    getVenuesStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    getVenuesSuccess: (state, action) => {
      state.isLoading = false;
      state.venues = action.payload.venues;
      state.pagination.total = action.payload.total ?? action.payload.count;
      state.pagination.page = action.payload.currentPage ?? state.pagination.page;
      state.pagination.limit = action.payload.limit ?? state.pagination.limit;
      state.pagination.totalPages = action.payload.totalPages ?? 1;
    },
    getVenuesFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Get venue by ID
    getVenueByIdStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    getVenueByIdSuccess: (state, action) => {
      state.isLoading = false;
      state.selectedVenue = action.payload;
    },
    getVenueByIdFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Update filters
    setFilter: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },

    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination.page = 1;
    },

    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  getVenuesStart,
  getVenuesSuccess,
  getVenuesFailure,
  getVenueByIdStart,
  getVenueByIdSuccess,
  getVenueByIdFailure,
  setFilter,
  clearFilters,
  setPage,
  clearError,
} = venueSlice.actions;

export default venueSlice.reducer;
