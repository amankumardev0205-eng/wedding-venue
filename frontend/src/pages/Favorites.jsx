import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import VenueCard from '../components/VenueCard';
import { getFavoritesStart, getFavoritesSuccess, getFavoritesFailure, setFavoritesPage } from '../redux/favoritesSlice';
import { favoritesAPI } from '../utils/api';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Favorites() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { favorites, isLoading, error, pagination } = useSelector((state) => state.favorites);
  const { user } = useSelector((state) => state.auth);
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

  const inputClass = 'w-full clay-inset bg-transparent px-4 py-3 text-sm text-[var(--text-body)] outline-none placeholder:text-[var(--text-muted)] transition';

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 text-[var(--text-body)]">
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#cf5577]">Your Collection</p>
        <h1 className="mt-3 text-4xl font-extrabold leading-tight text-[var(--text-dark)] md:text-5xl">My Favorite Venues</h1>
      </div>

      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4 clay-card p-5">
        <input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            dispatch(setFavoritesPage(1));
          }}
          placeholder="Search favorite venues..."
          className={inputClass}
        />
        <input
          value={city}
          onChange={(event) => {
            setCity(event.target.value);
            dispatch(setFavoritesPage(1));
          }}
          placeholder="Filter by city..."
          className={inputClass}
        />
        <select
          value={sort}
          onChange={(event) => {
            setSort(event.target.value);
            dispatch(setFavoritesPage(1));
          }}
          className={inputClass}
        >
          <option value="saved">Recently saved</option>
          <option value="name">Name</option>
          <option value="rating">Highest rated</option>
          <option value="price-low">Price: low to high</option>
          <option value="price-high">Price: high to low</option>
        </select>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-100 p-4 text-red-700">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#cf5577]" />
        </div>
      )}

      {!isLoading && favorites.length > 0 && (
        <>
          <p className="text-lg text-[var(--text-muted)] mb-6">
            You have <span className="font-semibold text-[#cf5577]">{pagination.total}</span> favorite venue{pagination.total > 1 ? 's' : ''}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((venue) => (
              <VenueCard key={venue._id} venue={venue} />
            ))}
          </div>
          
          {pagination.totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-4">
              <button
                onClick={() => dispatch(setFavoritesPage(Math.max(1, pagination.page - 1)))}
                disabled={pagination.page === 1}
                className="rounded-lg bg-white/70 px-5 py-2 text-[var(--text-body)] disabled:opacity-50 clay-button"
              >
                Previous
              </button>
              <span className="text-[var(--text-body)]">Page {pagination.page} of {pagination.totalPages}</span>
              <button
                onClick={() => dispatch(setFavoritesPage(Math.min(pagination.totalPages, pagination.page + 1)))}
                disabled={pagination.page === pagination.totalPages}
                className="rounded-lg bg-white/70 px-5 py-2 text-[var(--text-body)] disabled:opacity-50 clay-button"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {!isLoading && favorites.length === 0 && !error && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 py-16 px-6 text-center clay-card flex flex-col items-center justify-center border border-[var(--border-light)] rounded-2xl shadow-sm bg-white dark:bg-[#211C1F]"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 mb-5 shadow-sm text-[#E85D83] dark:text-[#F06D91]">
            <Heart className="fill-current text-[#E85D83] dark:text-[#F06D91]" size={28} />
          </div>
          <h3 className="text-xl font-bold text-[var(--text-dark)] mb-2">No Saved Favorites</h3>
          <p className="max-w-md text-sm text-[var(--text-muted)] mb-6 leading-relaxed">
            Browse wedding venues and save your favorite choices here to compare and track them.
          </p>
          <button
            onClick={() => navigate('/venues')}
            className="rounded-xl bg-[#E85D83] hover:bg-[#C43C62] dark:bg-[#F06D91] dark:hover:bg-[#E85D83] px-6 py-2.5 text-xs font-bold text-white transition hover:-translate-y-[1px] shadow-sm cursor-pointer"
          >
            Browse Venues
          </button>
        </motion.div>
      )}
    </div>
  );
}
