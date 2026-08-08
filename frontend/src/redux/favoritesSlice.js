import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  favorites: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
  },
};

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    // Get favorites
    getFavoritesStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    getFavoritesSuccess: (state, action) => {
      state.isLoading = false;
      state.favorites = action.payload.favorites || action.payload;
      state.pagination.total = action.payload.total ?? action.payload.count ?? state.favorites.length;
      state.pagination.page = action.payload.currentPage ?? state.pagination.page;
      state.pagination.limit = action.payload.limit ?? state.pagination.limit;
      state.pagination.totalPages = action.payload.totalPages ?? 1;
    },
    getFavoritesFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Add favorite
    addFavoriteStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    addFavoriteSuccess: (state, action) => {
      state.isLoading = false;
      if (!state.favorites.find((f) => f._id === action.payload._id)) {
        state.favorites.push(action.payload);
      }
    },
    addFavoriteFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Remove favorite
    removeFavoriteStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    removeFavoriteSuccess: (state, action) => {
      state.isLoading = false;
      state.favorites = state.favorites.filter((f) => f._id !== action.payload);
    },
    removeFavoriteFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    setFavoritesPage: (state, action) => {
      state.pagination.page = action.payload;
    },
  },
});

export const {
  getFavoritesStart,
  getFavoritesSuccess,
  getFavoritesFailure,
  addFavoriteStart,
  addFavoriteSuccess,
  addFavoriteFailure,
  removeFavoriteStart,
  removeFavoriteSuccess,
  removeFavoriteFailure,
  setFavoritesPage,
  clearError,
} = favoritesSlice.actions;

export default favoritesSlice.reducer;
