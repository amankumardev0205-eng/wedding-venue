import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedVenues: [],
  maxCompare: 4, // Limit to 4 venues for comparison
};

const compareSlice = createSlice({
  name: 'compare',
  initialState,
  reducers: {
    addToCompare: (state, action) => {
      const venue = action.payload;
      const exists = state.selectedVenues.some((v) => v._id === venue._id);

      if (!exists && state.selectedVenues.length < state.maxCompare) {
        state.selectedVenues.push(venue);
      }
    },

    removeFromCompare: (state, action) => {
      const venueId = action.payload;
      state.selectedVenues = state.selectedVenues.filter((v) => v._id !== venueId);
    },

    clearCompare: (state) => {
      state.selectedVenues = [];
    },

    isInCompare: (state, action) => {
      const venueId = action.payload;
      return state.selectedVenues.some((v) => v._id === venueId);
    },
  },
});

export const {
  addToCompare,
  removeFromCompare,
  clearCompare,
  isInCompare,
} = compareSlice.actions;

export default compareSlice.reducer;
