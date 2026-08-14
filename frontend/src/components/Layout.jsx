import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './Header';
import Footer from './Footer';
import { initSocketClient } from '../utils/socket';
import { useSelector, useDispatch } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getInquiriesStart, getInquiriesSuccess, getInquiriesFailure } from '../redux/inquirySlice';
import { addMessage, setTypingStatus } from '../redux/chatSlice';
import { inquiryAPI } from '../utils/api';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth || {});
  const { activeUserId } = useSelector((state) => state.chat || {});
  const isHome = location.pathname === '/';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const socket = initSocketClient();
    if (!socket) return undefined;

    // join rooms when user info is available
    const userId = user?._id || user?.id || null;
    if (userId) {
      socket.emit('room:join', userId);
      if (user.role === 'admin') {
        socket.emit('room:join', 'admins');
      }
    }

    const handleInquiryCreated = async (payload) => {
      toast.info('New inquiry received');
      // refresh inquiries list for current user if applicable
      try {
        dispatch(getInquiriesStart());
        const res = await inquiryAPI.getInquiries();
        dispatch(getInquiriesSuccess(res.data.inquiries));
      } catch (err) {
        dispatch(getInquiriesFailure(err.response?.data?.message || 'Failed to refresh inquiries'));
      }
    };

    const handleInquiryUpdated = async (payload) => {
      toast.info('Inquiry status updated');
      try {
        dispatch(getInquiriesStart());
        const res = await inquiryAPI.getInquiries();
        dispatch(getInquiriesSuccess(res.data.inquiries));
      } catch (err) {
        dispatch(getInquiriesFailure(err.response?.data?.message || 'Failed to refresh inquiries'));
      }
    };

    const handleChatMessage = (message) => {
      dispatch(addMessage(message));
      const myUserId = user?._id || user?.id;
      if (message.sender !== myUserId && message.sender !== activeUserId) {
        toast.info(`New message: "${message.text.substring(0, 30)}${message.text.length > 30 ? '...' : ''}"`, {
          onClick: () => navigate('/chat')
        });
      }
    };

    const handleChatTyping = (data) => {
      dispatch(setTypingStatus(data));
    };

    socket.on('inquiry:created', handleInquiryCreated);
    socket.on('inquiry:updated', handleInquiryUpdated);
    socket.on('chat:message', handleChatMessage);
    socket.on('chat:typing', handleChatTyping);

    return () => {
      socket.off('inquiry:created', handleInquiryCreated);
      socket.off('inquiry:updated', handleInquiryUpdated);
      socket.off('chat:message', handleChatMessage);
      socket.off('chat:typing', handleChatTyping);
    };
  }, [dispatch, user, activeUserId, navigate]);

  return (
    <div className="min-h-screen relative bg-[var(--bg-slate)] text-[var(--text-body)]">
      {!isHome && <div className="animated-bg animate-float" aria-hidden="true" />}
      <Header />

      <main className={isHome ? 'w-full' : 'main-content'}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.36 }}
            className="w-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
      <ToastContainer position="top-right" />
    </div>
  );
}
