import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  inquiries: [],
  selectedInquiry: null,
  isLoading: false,
  error: null,
};

const inquirySlice = createSlice({
  name: 'inquiries',
  initialState,
  reducers: {
    // Get inquiries
    getInquiriesStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    getInquiriesSuccess: (state, action) => {
      state.isLoading = false;
      state.inquiries = action.payload;
    },
    getInquiriesFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Create inquiry
    createInquiryStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    createInquirySuccess: (state, action) => {
      state.isLoading = false;
      state.inquiries.push(action.payload);
    },
    createInquiryFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Update inquiry status
    updateInquiryStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    updateInquirySuccess: (state, action) => {
      state.isLoading = false;
      const index = state.inquiries.findIndex((i) => i._id === action.payload._id);
      if (index !== -1) {
        state.inquiries[index] = action.payload;
      }
    },
    updateInquiryFailure: (state, action) => {
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
  getInquiriesStart,
  getInquiriesSuccess,
  getInquiriesFailure,
  createInquiryStart,
  createInquirySuccess,
  createInquiryFailure,
  updateInquiryStart,
  updateInquirySuccess,
  updateInquiryFailure,
  clearError,
} = inquirySlice.actions;

export default inquirySlice.reducer;
