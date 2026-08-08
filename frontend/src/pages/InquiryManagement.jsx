import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from '../components/Navbar';
import { getInquiriesStart, getInquiriesSuccess, getInquiriesFailure, updateInquirySuccess } from '../redux/inquirySlice';
import { inquiryAPI } from '../utils/api';
import { FaCalendar, FaUsers, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';
import api from '../utils/api';
import { createCheckout } from '../utils/payments';
import { MessageSquare } from 'lucide-react';

export default function InquiryManagement() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { inquiries, isLoading, error } = useSelector((state) => state.inquiries);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user || (user.role !== 'organizer' && user.role !== 'admin')) {
      navigate('/');
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

  const handleStatusUpdate = async (inquiryId, newStatus, response = '') => {
    dispatch(getInquiriesStart());
    try {
      const res = await inquiryAPI.updateInquiryStatus(inquiryId, {
        status: newStatus,
        organizerResponse: response,
      });
      dispatch(updateInquirySuccess(res.data.inquiry));
      alert(`Inquiry ${newStatus} successfully!`);
    } catch (err) {
      dispatch(getInquiriesFailure(err.response?.data?.message || 'Failed to update inquiry'));
    }
  };

  const downloadICS = async (bookingId, fileName) => {
    try {
      const resp = await api.get(`/bookings/${bookingId}/ics`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([resp.data], { type: 'text/calendar' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || `booking-${bookingId}.ics`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      alert('Unable to download calendar file');
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

  // Filter inquiries by status
  const pendingInquiries = inquiries.filter((i) => i.status === 'pending');
  const respondedInquiries = inquiries.filter((i) => i.status !== 'pending');

  if (!user || (user.role !== 'organizer' && user.role !== 'admin')) return null;

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Manage Inquiries</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading inquiries...</p>
          </div>
        )}

        {!isLoading && (
          <>
            {/* Pending Inquiries */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 text-yellow-700">
                Pending Inquiries ({pendingInquiries.length})
              </h2>

              {pendingInquiries.length > 0 ? (
                <div className="space-y-4">
                  {pendingInquiries.map((inquiry) => (
                    <div key={inquiry._id} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-gray-600 text-sm">Customer</p>
                          <p className="font-semibold">{inquiry.customer.name}</p>
                          <p className="text-sm text-gray-600">{inquiry.customer.email}</p>
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
                          <p className="text-gray-600 text-sm">Event Type</p>
                          <p className="font-semibold capitalize">{inquiry.eventType}</p>
                        </div>
                      </div>

                      {inquiry.message && (
                        <div className="mb-4 p-4 bg-gray-50 rounded">
                          <p className="text-sm text-gray-600 mb-1">Customer Message:</p>
                          <p className="text-gray-800">{inquiry.message}</p>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => {
                            const response = prompt('Enter your response message (optional):');
                            handleStatusUpdate(inquiry._id, 'accepted', response || '');
                          }}
                          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm font-semibold"
                        >
                          Accept Inquiry
                        </button>
                        <button
                          onClick={async () => {
                            // Example invoice line item for organizer to request payment
                            try {
                              const items = [{ name: `Booking - ${inquiry.venue.name}`, amount: (inquiry.estimatedAmount || 1000), quantity: 1, currency: 'usd' }];
                              const data = await createCheckout(items);
                              if (data.url) window.location.href = data.url;
                            } catch (err) {
                              alert('Unable to create checkout session');
                            }
                          }}
                          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition text-sm font-semibold"
                        >
                          Request Payment
                        </button>
                        <button
                          onClick={() => {
                            const response = prompt('Enter rejection reason (optional):');
                            handleStatusUpdate(inquiry._id, 'rejected', response || '');
                          }}
                          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm font-semibold"
                        >
                          Reject Inquiry
                        </button>
                        {inquiry.customer && (
                          <button
                            onClick={() => navigate(`/chat?userId=${inquiry.customer._id || inquiry.customer.id}`)}
                            className="px-4 py-2 text-[#cf5577] bg-white border border-[#cf5577]/30 hover:border-[#cf5577] rounded-lg transition text-sm font-semibold flex items-center gap-2 shadow-sm"
                          >
                            <MessageSquare size={16} />
                            Chat with Couple
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No pending inquiries</p>
              )}
            </div>

            {/* Responded Inquiries */}
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-700">
                Responded Inquiries ({respondedInquiries.length})
              </h2>

              {respondedInquiries.length > 0 ? (
                <div className="space-y-4">
                  {respondedInquiries.map((inquiry) => (
                    <div key={inquiry._id} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-gray-300">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-gray-600 text-sm">Customer</p>
                          <p className="font-semibold">{inquiry.customer.name}</p>
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
                            {inquiry.status === 'accepted' && inquiry.booking && (
                              <div className="mt-2">
                                <button onClick={() => downloadICS(inquiry.booking, `booking-${inquiry.booking}.ics`)} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Download ICS</button>
                              </div>
                            )}
                        </div>
                      </div>

                      {inquiry.organizerResponse && (
                        <div className="p-4 bg-blue-50 rounded border border-blue-200">
                          <p className="text-sm text-gray-600 mb-1">Your Response:</p>
                          <p className="text-gray-800">{inquiry.organizerResponse}</p>
                        </div>
                      )}
                      
                      <div className="mt-4 flex flex-wrap gap-3">
                        {inquiry.customer && (
                          <button
                            onClick={() => navigate(`/chat?userId=${inquiry.customer._id || inquiry.customer.id}`)}
                            className="px-4 py-2 text-[#cf5577] bg-white border border-[#cf5577]/30 hover:border-[#cf5577] rounded-lg transition text-sm font-semibold flex items-center gap-2 shadow-sm"
                          >
                            <MessageSquare size={16} />
                            Chat with Couple
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No responded inquiries</p>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
