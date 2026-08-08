import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import venueReducer from './venueSlice';
import inquiryReducer from './inquirySlice';
import favoritesReducer from './favoritesSlice';
import organizerVenuesReducer from './organizerVenuesSlice';
import reviewReducer from './reviewSlice';
import compareReducer from './compareSlice';
import adminReducer from './adminSlice';
import chatReducer from './chatSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    venues: venueReducer,
    inquiries: inquiryReducer,
    favorites: favoritesReducer,
    organizerVenues: organizerVenuesReducer,
    reviews: reviewReducer,
    compare: compareReducer,
    admin: adminReducer,
    chat: chatReducer,
  },
});

export default store;
