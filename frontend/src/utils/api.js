import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
};

// Venue API calls
export const venueAPI = {
  getVenues: (params) => api.get('/venues', { params }),
  getVenueById: (id) => api.get(`/venues/${id}`),
  getVenuesByCity: (city) => api.get(`/venues/city/${city}`),
  createVenue: (data) => api.post('/venues', data),
  updateVenue: (id, data) => api.put(`/venues/${id}`, data),
  deleteVenue: (id) => api.delete(`/venues/${id}`),
};

// Inquiry API calls
export const inquiryAPI = {
  createInquiry: (data) => api.post('/inquiries', data),
  getInquiries: () => api.get('/inquiries'),
  getInquiryById: (id) => api.get(`/inquiries/${id}`),
  updateInquiryStatus: (id, data) => api.put(`/inquiries/${id}/status`, data),
  markDateUnavailable: (id, data) => api.put(`/inquiries/${id}/mark-unavailable`, data),
  deleteInquiry: (id) => api.delete(`/inquiries/${id}`),
};

// Favorites API calls
export const favoritesAPI = {
  getFavorites: (params) => api.get('/favorites', { params }),
  isFavorite: (venueId) => api.get(`/favorites/${venueId}`),
  addFavorite: (venueId) => api.post(`/favorites/${venueId}`),
  removeFavorite: (venueId) => api.delete(`/favorites/${venueId}`),
};

// Venue Management API calls (for organizers)
export const venueManagementAPI = {
  getOrganizerVenues: () => api.get('/venue-management'),
  createVenue: (data) => api.post('/venue-management', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getVenueForEdit: (venueId) => api.get(`/venue-management/${venueId}`),
  updateVenue: (venueId, data) => api.put(`/venue-management/${venueId}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteVenue: (venueId) => api.delete(`/venue-management/${venueId}`),
};

// Review API calls
export const reviewAPI = {
  createReview: (data) => api.post('/reviews', data),
  getVenueReviews: (venueId, params) => api.get(`/reviews/venue/${venueId}`, { params }),
  getReviewById: (id) => api.get(`/reviews/${id}`),
  updateReview: (id, data) => api.put(`/reviews/${id}`, data),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
  addOrganizerReply: (id, data) => api.put(`/reviews/${id}/reply`, data),
  markHelpful: (id) => api.put(`/reviews/${id}/helpful`),
};

// Admin API calls
export const adminAPI = {
  getAllUsers: (params) => api.get('/admin/users', { params }),
  getAllOrganizers: (params) => api.get('/admin/organizers', { params }),
  getAllVenues: (params) => api.get('/admin/venues', { params }),
  removeVenue: (id) => api.delete(`/admin/venues/${id}`),
  getAllReviews: (params) => api.get('/admin/reviews', { params }),
  removeReview: (id) => api.delete(`/admin/reviews/${id}`),
  getAnalytics: () => api.get('/admin/analytics'),
};

// Chat API calls
export const chatAPI = {
  getMessages: (otherUserId) => api.get(`/chat/messages/${otherUserId}`),
  getConversations: () => api.get('/chat/conversations'),
  sendMessage: (data) => api.post('/chat/messages', data),
  markAsRead: (otherUserId) => api.post(`/chat/read/${otherUserId}`),
};

export default api;
