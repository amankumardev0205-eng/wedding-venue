import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Calendar, Users, CheckCircle, Clock, XCircle, MessageSquare, Download, CreditCard } from 'lucide-react';

import { getInquiriesStart, getInquiriesSuccess, getInquiriesFailure, updateInquirySuccess } from '../redux/inquirySlice';
import { inquiryAPI } from '../utils/api';
import api from '../utils/api';
import { createCheckout } from '../utils/payments';

// UI components
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';

export default function InquiryManagement() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { inquiries, isLoading, error } = useSelector((state) => state.inquiries || { inquiries: [], isLoading: false, error: null });
  const { user } = useSelector((state) => state.auth || {});

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
          <Badge variant="success" className="text-xs py-1 px-3 capitalize font-bold flex items-center gap-1.5 w-fit select-none">
            <CheckCircle size={13} className="shrink-0" />
            <span>Accepted</span>
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="danger" className="text-xs py-1 px-3 capitalize font-bold flex items-center gap-1.5 w-fit select-none">
            <XCircle size={13} className="shrink-0" />
            <span>Rejected</span>
          </Badge>
        );
      default:
        return (
          <Badge variant="warning" className="text-xs py-1 px-3 capitalize font-bold flex items-center gap-1.5 w-fit select-none">
            <Clock size={13} className="shrink-0" />
            <span>Pending</span>
          </Badge>
        );
    }
  };

  // Filter inquiries by status
  const pendingInquiries = inquiries.filter((i) => i.status === 'pending');
  const respondedInquiries = inquiries.filter((i) => i.status !== 'pending');

  if (!user || (user.role !== 'organizer' && user.role !== 'admin')) return null;

  return (
    <div className="min-h-screen text-[var(--text-body)] pt-8 pb-16 bg-[var(--bg-slate)] transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Page Header */}
        <div className="mb-8 flex flex-col gap-2 select-none">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Customer Booking Requests</span>
          <h1 className="font-serif text-3xl md:text-5xl font-extrabold text-[var(--text-dark)] leading-tight tracking-wide">
            Manage Inquiries
          </h1>
          <p className="text-sm text-[var(--text-muted)] font-medium leading-relaxed max-w-[500px]">
            Review event dates, coordinate details, and update client request statuses.
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-6">
            <ErrorState 
              title="Unable to load inquiries"
              message={error}
              onRetry={fetchInquiries}
            />
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="text-center py-16 select-none flex flex-col items-center justify-center">
            <div className="h-10 w-10 rounded-full border-2 border-primary/10 border-t-primary animate-spin mb-3" />
            <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Loading inquiries...</p>
          </div>
        )}

        {!isLoading && (
          <div className="space-y-12">
            
            {/* PENDING INQUIRIES SECTION */}
            <div>
              <h2 className="font-serif text-xl font-bold mb-5 text-amber-600 dark:text-amber-500 flex items-center gap-2 select-none">
                <Clock size={18} />
                <span>Pending Inquiries ({pendingInquiries.length})</span>
              </h2>

              {pendingInquiries.length > 0 ? (
                <div className="space-y-4">
                  {pendingInquiries.map((inquiry) => (
                    <Card 
                      key={inquiry._id} 
                      className="border border-[var(--border-medium)] border-l-4 border-l-amber-500 hover:shadow-sm transition-all duration-200"
                    >
                      <CardContent className="p-6 flex flex-col gap-5">
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 border-b border-[var(--border-light)] pb-4">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] select-none">Customer info</span>
                            <p className="font-bold text-sm text-[var(--text-dark)] leading-snug mt-1">{inquiry.customer.name}</p>
                            <p className="text-xs text-[var(--text-muted)] font-semibold select-text">{inquiry.customer.email}</p>
                          </div>

                          <div className="flex items-start gap-2.5">
                            <Calendar className="text-primary shrink-0 mt-0.5" size={16} />
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] select-none">Event Date</span>
                              <p className="font-semibold text-sm text-[var(--text-dark)] mt-1">
                                {new Date(inquiry.eventDate).toLocaleDateString(undefined, {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-2.5">
                            <Users className="text-primary shrink-0 mt-0.5" size={16} />
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] select-none">Guests Count</span>
                              <p className="font-semibold text-sm text-[var(--text-dark)] mt-1">{inquiry.guestCount} guests</p>
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] select-none">Event Type</span>
                            <p className="font-semibold text-sm text-[var(--text-dark)] capitalize mt-1">{inquiry.eventType}</p>
                          </div>
                        </div>

                        {/* Customer Message details */}
                        {inquiry.message && (
                          <div className="p-4 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-xl select-text text-sm">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 select-none block mb-1">Customer Message</span>
                            <p className="text-[var(--text-body)] leading-relaxed">{inquiry.message}</p>
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex flex-wrap gap-2.5 mt-1 select-none">
                          <Button
                            onClick={() => {
                              const response = prompt('Enter your response message (optional):');
                              handleStatusUpdate(inquiry._id, 'accepted', response || '');
                            }}
                            variant="primary"
                            size="sm"
                            className="font-bold"
                          >
                            Accept Inquiry
                          </Button>
                          
                          <Button
                            onClick={async () => {
                              try {
                                const items = [{ name: `Booking - ${inquiry.venue.name}`, amount: (inquiry.estimatedAmount || 1000), quantity: 1, currency: 'usd' }];
                                const data = await createCheckout(items);
                                if (data.url) window.location.href = data.url;
                              } catch (err) {
                                alert('Unable to create checkout session');
                              }
                            }}
                            variant="outline"
                            size="sm"
                            className="font-bold text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 dark:border-indigo-900/30"
                            leftIcon={<CreditCard size={13} />}
                          >
                            Request Payment
                          </Button>

                          <Button
                            onClick={() => {
                              const response = prompt('Enter rejection reason (optional):');
                              handleStatusUpdate(inquiry._id, 'rejected', response || '');
                            }}
                            variant="outline"
                            size="sm"
                            className="font-bold text-red-650 border-red-200 hover:bg-red-50"
                          >
                            Reject Inquiry
                          </Button>

                          {inquiry.customer && (
                            <Button
                              onClick={() => navigate(`/chat?userId=${inquiry.customer._id || inquiry.customer.id}`)}
                              variant="outline"
                              size="sm"
                              className="font-bold text-primary border-primary/20 hover:bg-primary/5 ml-auto"
                              leftIcon={<MessageSquare size={13} />}
                            >
                              Chat with Couple
                            </Button>
                          )}
                        </div>

                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center border border-dashed border-stone-200 dark:border-stone-800 rounded-2xl select-none">
                  <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider py-4">No pending inquiries</p>
                </div>
              )}
            </div>

            {/* RESPONDED INQUIRIES SECTION */}
            <div>
              <h2 className="font-serif text-xl font-bold mb-5 text-[var(--text-dark)] flex items-center gap-2 select-none">
                <CheckCircle size={18} />
                <span>Responded Inquiries ({respondedInquiries.length})</span>
              </h2>

              {respondedInquiries.length > 0 ? (
                <div className="space-y-4">
                  {respondedInquiries.map((inquiry) => (
                    <Card 
                      key={inquiry._id} 
                      className="border border-[var(--border-medium)] border-l-4 border-l-stone-300 hover:shadow-sm transition-all duration-200"
                    >
                      <CardContent className="p-6 flex flex-col gap-5">
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 border-b border-[var(--border-light)] pb-4">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] select-none">Customer info</span>
                            <p className="font-bold text-sm text-[var(--text-dark)] leading-snug mt-1">{inquiry.customer.name}</p>
                          </div>

                          <div className="flex items-start gap-2.5">
                            <Calendar className="text-primary shrink-0 mt-0.5" size={16} />
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] select-none">Event Date</span>
                              <p className="font-semibold text-sm text-[var(--text-dark)] mt-1">
                                {new Date(inquiry.eventDate).toLocaleDateString(undefined, {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-2.5">
                            <Users className="text-primary shrink-0 mt-0.5" size={16} />
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] select-none">Guests Count</span>
                              <p className="font-semibold text-sm text-[var(--text-dark)] mt-1">{inquiry.guestCount} guests</p>
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] select-none">Status</span>
                            <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-2">
                              {getStatusBadge(inquiry.status)}
                              {inquiry.status === 'accepted' && inquiry.booking && (
                                <Button 
                                  onClick={() => downloadICS(inquiry.booking, `booking-${inquiry.booking}.ics`)} 
                                  variant="outline" 
                                  size="xs"
                                  className="font-bold border-stone-200"
                                  leftIcon={<Download size={11} />}
                                >
                                  Download ICS
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Organizer response callout */}
                        {inquiry.organizerResponse && (
                          <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl select-text text-sm border-l-4 border-l-primary">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-primary select-none block mb-1">Your Response</span>
                            <p className="text-[var(--text-body)] leading-relaxed">{inquiry.organizerResponse}</p>
                          </div>
                        )}
                        
                        <div className="flex flex-wrap gap-2.5 mt-1 select-none">
                          {inquiry.customer && (
                            <Button
                              onClick={() => navigate(`/chat?userId=${inquiry.customer._id || inquiry.customer.id}`)}
                              variant="outline"
                              size="sm"
                              className="font-bold text-primary border-primary/20 hover:bg-primary/5"
                              leftIcon={<MessageSquare size={13} />}
                            >
                              Chat with Couple
                            </Button>
                          )}
                        </div>

                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center border border-dashed border-stone-200 dark:border-stone-800 rounded-2xl select-none">
                  <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider py-4">No responded inquiries</p>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
