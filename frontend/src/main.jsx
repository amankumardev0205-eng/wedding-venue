import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Home from './pages/Home';
import Venues from './pages/Venues';
import VenueDetails from './pages/VenueDetails';
import SendInquiry from './pages/SendInquiry';
import MyInquiries from './pages/MyInquiries';
import InquiryManagement from './pages/InquiryManagement';
import OrganizerDashboard from './pages/OrganizerDashboard';
import Favorites from './pages/Favorites';
import CompareVenues from './pages/CompareVenues';
import AdminDashboard from './pages/AdminDashboard';
import ChatPortal from './pages/ChatPortal';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import './index.css';
import 'leaflet/dist/leaflet.css';
import ThemeProvider from './components/ThemeProvider';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="reset-password/:token" element={<ResetPassword />} />
              <Route path="venues" element={<Venues />} />
              <Route path="venues/:id" element={<VenueDetails />} />

              <Route
                path="inquiry/:venueId"
                element={
                  <ProtectedRoute>
                    <SendInquiry />
                  </ProtectedRoute>
                }
              />

              <Route
                path="my-inquiries"
                element={
                  <ProtectedRoute>
                    <MyInquiries />
                  </ProtectedRoute>
                }
              />

              <Route
                path="favorites"
                element={
                  <ProtectedRoute>
                    <Favorites />
                  </ProtectedRoute>
                }
              />

              <Route path="compare" element={<CompareVenues />} />

              <Route
                path="chat"
                element={
                  <ProtectedRoute>
                    <ChatPortal />
                  </ProtectedRoute>
                }
              />

              <Route
                path="inquiry-management"
                element={
                  <ProtectedRoute allowedRoles={["organizer", "admin"]}>
                    <InquiryManagement />
                  </ProtectedRoute>
                }
              />

              <Route
                path="organizer-dashboard"
                element={
                  <ProtectedRoute allowedRoles={["organizer", "admin"]}>
                    <OrganizerDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="admin"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </Router>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);
