import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Search, MapPin, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

import VenueCard from '../components/VenueCard';
import VenueCardSkeleton from '../components/VenueCardSkeleton';
import { getFavoritesStart, getFavoritesSuccess, getFavoritesFailure, setFavoritesPage } from '../redux/favoritesSlice';
import { favoritesAPI } from '../utils/api';

// UI components
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { Card, CardContent } from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';

export default function Favorites() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { favorites, isLoading, error, pagination } = useSelector((state) => state.favorites || { favorites: [], isLoading: false, error: null, pagination: { page: 1, limit: 9 } });
  const { user } = useSelector((state) => state.auth || {});
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [sort, setSort] = useState('saved');
  const favoriteQuery = useMemo(() => ({ search, city, sort }), [search, city, sort]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchFavorites();
  }, [user, pagination.page, favoriteQuery]);

  const fetchFavorites = async () => {
    dispatch(getFavoritesStart());
    try {
      const response = await favoritesAPI.getFavorites({
        page: pagination.page,
        limit: pagination.limit,
        search,
        city,
        sort,
      });
      dispatch(getFavoritesSuccess(response.data));
    } catch (err) {
      dispatch(getFavoritesFailure(err.response?.data?.message || 'Failed to fetch favorites'));
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen text-[var(--text-body)] pt-8 pb-16 bg-[var(--bg-slate)] transition-colors duration-300">
      <div className="mx-auto max-w-6xl px-6">
        
        {/* Page Header */}
        <div className="mb-8 flex flex-col gap-2 select-none">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Your Collection</span>
          <h1 className="font-serif text-3xl md:text-5xl font-extrabold text-[var(--text-dark)] leading-tight tracking-wide">
            My Favorite Venues
          </h1>
          <p className="text-sm text-[var(--text-muted)] font-medium leading-relaxed max-w-[500px]">
            Keep all the wedding venues you love in one organized planning space.
          </p>
        </div>

        {/* Filters Card */}
        <Card className="mb-8 border border-[var(--border-medium)] shadow-sm">
          <CardContent className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                dispatch(setFavoritesPage(1));
              }}
              placeholder="Search favorite venues..."
              leftIcon={<Search size={14} className="text-[var(--text-muted)]" />}
              aria-label="Search favorite venues"
            />
            
            <Input
              value={city}
              onChange={(event) => {
                setCity(event.target.value);
                dispatch(setFavoritesPage(1));
              }}
              placeholder="Filter by city..."
              leftIcon={<MapPin size={14} className="text-[var(--text-muted)]" />}
              aria-label="Filter favorites by city"
            />
            
            <Select
              value={sort}
              onChange={(event) => {
                setSort(event.target.value);
                dispatch(setFavoritesPage(1));
              }}
              aria-label="Sort options"
            >
              <option value="saved">Recently saved</option>
              <option value="name">Name</option>
              <option value="rating">Highest rated</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
            </Select>
          </CardContent>
        </Card>

        {/* Error Handling */}
        {error && (
          <ErrorState 
            title="Failed to fetch favorites"
            message={error}
            onRetry={fetchFavorites}
          />
        )}

        {/* Loading skeletons grid */}
        {isLoading && (
          <div>
            <div className="mb-6 flex items-center justify-between select-none">
              <div className="h-5 w-40 animate-pulse rounded bg-stone-250 dark:bg-stone-800/40" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: pagination.limit || 3 }).map((_, idx) => (
                <div key={idx} className="w-full">
                  <VenueCardSkeleton />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Favorites Listings Grid */}
        {!isLoading && !error && favorites.length > 0 && (
          <>
            <div className="mb-6 select-none">
              <p className="text-sm font-semibold text-[var(--text-muted)]">
                You have <span className="font-bold text-primary">{pagination.total}</span> favorite venue{pagination.total > 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((venue) => (
                <div key={venue._id} className="w-full">
                  <VenueCard venue={venue} />
                </div>
              ))}
            </div>
            
            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-4 select-none">
                <Button
                  variant="outline"
                  onClick={() => dispatch(setFavoritesPage(Math.max(1, pagination.page - 1)))}
                  disabled={pagination.page === 1}
                  className="py-2.5 px-4 font-bold border-stone-200 dark:border-stone-850"
                >
                  Previous
                </Button>
                <span className="text-sm font-semibold text-[var(--text-dark)]">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => dispatch(setFavoritesPage(Math.min(pagination.totalPages, pagination.page + 1)))}
                  disabled={pagination.page === pagination.totalPages}
                  className="py-2.5 px-4 font-bold border-stone-200 dark:border-stone-850"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}

        {/* Empty Collection State */}
        {!isLoading && !error && favorites.length === 0 && (
          <EmptyState
            title="No favorite venues yet"
            description="Save venues you love while exploring wedding spaces to compare and coordinate choices."
            action={
              <Button 
                variant="primary" 
                onClick={() => navigate('/venues')}
                className="shadow-sm font-bold"
              >
                Explore Venues
              </Button>
            }
          />
        )}
      </div>
    </div>
  );
}
