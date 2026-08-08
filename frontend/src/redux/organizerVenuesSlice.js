import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api.js';

export const fetchOrganizerVenues = createAsyncThunk(
  'organizerVenues/fetchVenues',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.venueManagementAPI.getOrganizerVenues();
      return response.data.venues;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch venues');
    }
  }
);

export const createNewVenue = createAsyncThunk(
  'organizerVenues/createVenue',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.venueManagementAPI.createVenue(formData);
      return response.data.venue;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create venue');
    }
  }
);

export const updateExistingVenue = createAsyncThunk(
  'organizerVenues/updateVenue',
  async ({ venueId, formData }, { rejectWithValue }) => {
    try {
      const response = await api.venueManagementAPI.updateVenue(venueId, formData);
      return response.data.venue;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update venue');
    }
  }
);

export const removeVenue = createAsyncThunk(
  'organizerVenues/deleteVenue',
  async (venueId, { rejectWithValue }) => {
    try {
      await api.venueManagementAPI.deleteVenue(venueId);
      return venueId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete venue');
    }
  }
);

const organizerVenuesSlice = createSlice({
  name: 'organizerVenues',
  initialState: {
    venues: [],
    loading: false,
    error: null,
    successMessage: '',
  },
  reducers: {
    clearMessages: (state) => {
      state.error = null;
      state.successMessage = '';
    },
  },
  extraReducers: (builder) => {
    // Fetch venues
    builder
      .addCase(fetchOrganizerVenues.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrganizerVenues.fulfilled, (state, action) => {
        state.loading = false;
        state.venues = action.payload;
        state.successMessage = 'Venues loaded successfully';
      })
      .addCase(fetchOrganizerVenues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Create venue
    builder
      .addCase(createNewVenue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNewVenue.fulfilled, (state, action) => {
        state.loading = false;
        state.venues.push(action.payload);
        state.successMessage = 'Venue created successfully!';
      })
      .addCase(createNewVenue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update venue
    builder
      .addCase(updateExistingVenue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExistingVenue.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.venues.findIndex((v) => v._id === action.payload._id);
        if (index !== -1) {
          state.venues[index] = action.payload;
        }
        state.successMessage = 'Venue updated successfully!';
      })
      .addCase(updateExistingVenue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete venue
    builder
      .addCase(removeVenue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeVenue.fulfilled, (state, action) => {
        state.loading = false;
        state.venues = state.venues.filter((v) => v._id !== action.payload);
        state.successMessage = 'Venue deleted successfully!';
      })
      .addCase(removeVenue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearMessages } = organizerVenuesSlice.actions;
export default organizerVenuesSlice.reducer;
