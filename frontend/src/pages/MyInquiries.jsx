import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { getInquiriesStart, getInquiriesSuccess, getInquiriesFailure } from '../redux/inquirySlice';
import { inquiryAPI } from '../utils/api';
import { FaCalendar, FaUsers, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';

export default function MyInquiries() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { inquiries, isLoading, error } = useSelector((state) => state.inquiries);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchInquiries();
  }, [user]);

  const fetchInquiries = async () => {
    dispatch(getInquiriesStart());
    try {
      const response = await inquiryAPI.getInquiries();
      dispatch(getInquiriesSuccess(response.data.inquiries));
    } catch (err) {
      dispatch(getInquiriesFailure(err.response?.data?.message || 'Failed to fetch inquiries'));
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
            <FaCheckCircle size={14} /> Accepted
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center gap-2 bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">
            <FaTimesCircle size={14} /> Rejected
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-2 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-semibold">
            <FaClock size={14} /> Pending
          </span>
        );
    }
  };

  if (!user) return null;

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.4 }}
        className="max-w-6xl mx-auto px-4 py-8"
      >
        <h1 className="text-4xl font-bold mb-8">My Inquiries</h1>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </motion.div>
        )}

        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-gray-200 animate-pulse">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-5 bg-gray-200 rounded w-2/4"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded-full w-24"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && inquiries.length > 0 && (
          <div className="space-y-4">
            {inquiries.map((inquiry) => (
              <motion.div 
                key={inquiry._id} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 border-l-4 border-blue-600"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-gray-600 text-sm">Venue</p>
                    <p className="font-semibold text-lg">{inquiry.venue.name}</p>
                  </div>

                  <div className="flex items-start gap-2">
                    <FaCalendar className="text-gray-600 mt-1" size={16} />
                    <div>
                      <p className="text-gray-600 text-sm">Event Date</p>
                      <p className="font-semibold">
                        {new Date(inquiry.eventDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <FaUsers className="text-gray-600 mt-1" size={16} />
                    <div>
                      <p className="text-gray-600 text-sm">Guests</p>
                      <p className="font-semibold">{inquiry.guestCount}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-600 text-sm">Status</p>
                    {getStatusBadge(inquiry.status)}
                  </div>
                </div>

                {inquiry.organizerResponse && (
                  <div className="mb-4 p-4 bg-blue-50 rounded border border-blue-200">
                    <p className="text-sm text-gray-600 mb-1">Organizer Response:</p>
                    <p className="text-gray-800">{inquiry.organizerResponse}</p>
                  </div>
                )}

                {inquiry.message && (
                  <div className="mb-4 p-4 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600 mb-1">Your Message:</p>
                    <p className="text-gray-800">{inquiry.message}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => navigate(`/venues/${inquiry.venue._id || inquiry.venue.id}`)}
                    className="px-4 py-2 text-white bg-[#cf5577] clay-button text-sm font-semibold"
                  >
                    View Venue
                  </button>
                  {inquiry.venue.organizer && (
                    <button
                      onClick={() => navigate(`/chat?userId=${inquiry.venue.organizer}`)}
                      className="px-4 py-2 text-[#cf5577] bg-white clay-button text-sm font-semibold flex items-center gap-2"
                    >
                      <MessageSquare size={16} />
                      Chat with Coordinator
                    </button>
                  )}
                  {inquiry.status === 'pending' && (
                    <button
                      onClick={() => alert('TODO: Implement cancel inquiry')}
                      className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50/10 active:scale-95 transition-all text-sm font-semibold"
                    >
                      Cancel Inquiry
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!isLoading && inquiries.length === 0 && !error && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 px-6 clay-card flex flex-col items-center justify-center border border-[var(--border-light)] rounded-2xl shadow-sm bg-white dark:bg-[#211C1F]"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 mb-5 shadow-sm text-[#E85D83] dark:text-[#F06D91]">
              <FaCalendar size={24} />
            </div>
            <h3 className="text-xl font-bold text-[var(--text-dark)] mb-2">No Inquiries Yet</h3>
            <p className="max-w-md text-sm text-[var(--text-muted)] mb-6 leading-relaxed">
              You haven't sent any inquiries to wedding venues yet. Discover your dream venues and reach out to them!
            </p>
            <button
              onClick={() => navigate('/venues')}
              className="rounded-xl bg-[#E85D83] hover:bg-[#C43C62] dark:bg-[#F06D91] dark:hover:bg-[#E85D83] px-6 py-2.5 text-xs font-bold text-white transition hover:-translate-y-[1px] shadow-sm cursor-pointer"
            >
              Browse Venues
            </button>
          </motion.div>
        )}
      </motion.div>
    </>
  );
}
