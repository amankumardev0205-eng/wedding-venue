import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Calendar, Users, CheckCircle, Clock, XCircle, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

import { getInquiriesStart, getInquiriesSuccess, getInquiriesFailure } from '../redux/inquirySlice';
import { inquiryAPI } from '../utils/api';

// UI components
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';

export default function MyInquiries() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { inquiries, isLoading, error } = useSelector((state) => state.inquiries || { inquiries: [], isLoading: false, error: null });
  const { user } = useSelector((state) => state.auth || {});

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

  if (!user) return null;

  return (
    <div className="min-h-screen text-[var(--text-body)] pt-8 pb-16 bg-[var(--bg-slate)] transition-colors duration-300">
      <div className="mx-auto max-w-6xl px-6">
        
        {/* Page Header */}
        <div className="mb-8 flex flex-col gap-2 select-none">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Venue Booking Requests</span>
          <h1 className="font-serif text-3xl md:text-5xl font-extrabold text-[var(--text-dark)] leading-tight tracking-wide">
            Your Inquiries
          </h1>
          <p className="text-sm text-[var(--text-muted)] font-medium leading-relaxed max-w-[500px]">
            Track status replies and coordinate schedules with venue coordinators.
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6">
            <ErrorState 
              title="Unable to load inquiries"
              message={error}
              onRetry={fetchInquiries}
            />
          </div>
        )}

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <Card key={n} className="border border-[var(--border-medium)] select-none">
                <CardContent className="p-6 space-y-4 animate-pulse">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <div className="h-3 bg-stone-200 dark:bg-stone-850 rounded w-1/4" />
                      <div className="h-5 bg-stone-250 dark:bg-stone-800/40 rounded w-3/4" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-stone-200 dark:bg-stone-850 rounded w-1/4" />
                      <div className="h-5 bg-stone-250 dark:bg-stone-800/40 rounded w-2/4" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-stone-200 dark:bg-stone-850 rounded w-1/4" />
                      <div className="h-5 bg-stone-250 dark:bg-stone-800/40 rounded w-1/4" />
                    </div>
                    <div className="h-7 bg-stone-250 dark:bg-stone-800/40 rounded-full w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Inquiries List */}
        {!isLoading && inquiries.length > 0 && (
          <div className="space-y-6">
            {inquiries.map((inquiry) => (
              <Card 
                key={inquiry._id} 
                className="border border-[var(--border-medium)] hover:border-primary/20 transition-all duration-200 hover:shadow-sm"
              >
                <CardContent className="p-6 flex flex-col gap-5">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-b border-[var(--border-light)] pb-4">
                    
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] select-none">Venue</span>
                      <p className="font-serif font-bold text-lg text-[var(--text-dark)] leading-snug mt-1 truncate" title={inquiry.venue.name}>
                        {inquiry.venue.name}
                      </p>
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
                      <div className="mt-1">
                        {getStatusBadge(inquiry.status)}
                      </div>
                    </div>

                  </div>

                  {/* Message displays */}
                  {inquiry.message && (
                    <div className="p-4 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-xl select-text text-sm">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 select-none block mb-1">Your Message</span>
                      <p className="text-[var(--text-body)] leading-relaxed">{inquiry.message}</p>
                    </div>
                  )}

                  {inquiry.organizerResponse && (
                    <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl select-text text-sm border-l-4 border-l-primary">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary select-none block mb-1">Coordinator Response</span>
                      <p className="text-[var(--text-body)] leading-relaxed">{inquiry.organizerResponse}</p>
                    </div>
                  )}

                  {/* Actions buttons */}
                  <div className="flex flex-wrap gap-3 mt-1 select-none">
                    <Button
                      onClick={() => navigate(`/venues/${inquiry.venue._id || inquiry.venue.id}`)}
                      variant="primary"
                      size="sm"
                      className="font-bold"
                    >
                      View Venue
                    </Button>
                    
                    {inquiry.venue.organizer && (
                      <Button
                        onClick={() => navigate(`/chat?userId=${inquiry.venue.organizer}`)}
                        variant="outline"
                        size="sm"
                        className="font-bold text-primary border-primary/20 hover:bg-primary/5"
                        leftIcon={<MessageSquare size={13} />}
                      >
                        Chat with Coordinator
                      </Button>
                    )}
                    
                    {inquiry.status === 'pending' && (
                      <Button
                        onClick={() => alert('TODO: Implement cancel inquiry')}
                        variant="outline"
                        size="sm"
                        className="font-bold text-red-600 border-red-200 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-950/20 ml-auto"
                      >
                        Cancel Inquiry
                      </Button>
                    )}
                  </div>

                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty Collection State */}
        {!isLoading && inquiries.length === 0 && !error && (
          <EmptyState
            title="No inquiries yet"
            description="You haven't sent any booking inquiries to venues yet. Discover your dream venues and reach out to coordinators!"
            action={
              <Button 
                variant="primary" 
                onClick={() => navigate('/venues')}
                className="shadow-sm font-bold"
              >
                Browse Venues
              </Button>
            }
          />
        )}
      </div>
    </div>
  );
}
