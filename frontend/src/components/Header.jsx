import React, { useContext, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, LayoutDashboard, LogOut, Moon, Scale, Shield, Sun, Menu, X } from 'lucide-react';
import { ThemeContext } from './ThemeProvider';
import { logout } from '../redux/authSlice';

export default function Header() {
  const { isAuthenticated, user } = useSelector((state) => state.auth || {});
  const { favorites } = useSelector((state) => state.favorites || { favorites: [] });
  const { selectedVenues } = useSelector((state) => state.compare || { selectedVenues: [] });
  const { theme, toggle } = useContext(ThemeContext);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const getLinkClass = (path) => {
    const isActive = location.pathname === path;
    return `text-sm font-medium transition-all duration-200 px-4 py-2 rounded-full ${
      isActive 
        ? 'text-primary bg-primary/10 shadow-sm border border-primary/20'
        : 'text-[var(--text-body)] hover:text-primary hover:bg-primary/5'
    }`;
  };

  const getMobileLinkClass = (path) => {
    const isActive = location.pathname === path;
    return `w-full text-left text-base font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center gap-3 ${
      isActive 
        ? 'text-primary bg-primary/10 border-l-4 border-primary'
        : 'text-[var(--text-body)] hover:text-primary hover:bg-primary/5'
    }`;
  };

  const handleLogout = () => {
    dispatch(logout());
    setIsMobileMenuOpen(false);
    navigate('/login');
  };

  return (
    <header className="sticky top-0 w-full px-4 py-4 z-50 transition-all duration-300">
      <div 
        className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3 rounded-2xl border shadow-sm transition-all duration-300"
        style={{
          background: theme === 'dark' ? 'rgba(26, 22, 24, 0.85)' : 'rgba(253, 251, 247, 0.85)',
          borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(139, 38, 62, 0.05)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)'
        }}
      >
        {/* LOGO */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 group focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-lg p-1"
        >
          <Heart size={18} className="fill-primary text-primary transition-transform group-hover:scale-110" />
          <span className="font-serif italic font-bold text-2xl tracking-wide text-[var(--text-dark)] transition-colors group-hover:text-primary">
            WedVenue
          </span>
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden lg:flex items-center gap-2">
          <Link to="/venues" className={getLinkClass('/venues')}>Browse Venues</Link>
          <Link to="/compare" className={`${getLinkClass('/compare')} inline-flex items-center gap-1.5`}>
            <Scale size={14} />
            <span>Compare</span>
            {selectedVenues?.length > 0 && (
              <span className="ml-1 text-xs bg-primary text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center font-bold">
                {selectedVenues.length}
              </span>
            )}
          </Link>
          {isAuthenticated && (
            <Link to="/favorites" className={`${getLinkClass('/favorites')} inline-flex items-center gap-1.5`}>
              <Heart size={14} />
              <span>Favorites</span>
              {favorites?.length > 0 && (
                <span className="ml-1 text-xs bg-primary text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center font-bold">
                  {favorites.length}
                </span>
              )}
            </Link>
          )}
          {isAuthenticated && <Link to="/my-inquiries" className={getLinkClass('/my-inquiries')}>My Inquiries</Link>}
          {user?.role === 'organizer' && (
            <Link to="/inquiry-management" className={getLinkClass('/inquiry-management')}>
              Manage Inquiries
            </Link>
          )}
          {(user?.role === 'organizer' || user?.role === 'admin') && (
            <Link to="/organizer-dashboard" className={`${getLinkClass('/organizer-dashboard')} inline-flex items-center gap-1.5`}>
              <LayoutDashboard size={14} />
              <span>Dashboard</span>
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin" className={`${getLinkClass('/admin')} inline-flex items-center gap-1.5`}>
              <Shield size={14} />
              <span>Admin</span>
            </Link>
          )}
        </nav>

        {/* DESKTOP ACTIONS */}
        <div className="hidden lg:flex items-center gap-3">
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 dark:border-white/10 bg-white/40 dark:bg-white/10 text-[var(--text-dark)] hover:bg-white/80 dark:hover:bg-white/20 transition-all shadow-sm shrink-0"
          >
            {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 border-l border-stone-200 dark:border-white/10 pl-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm shadow-sm select-none">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="font-semibold text-sm text-[var(--text-dark)] max-w-[120px] truncate">
                  {user?.name}
                </span>
              </div>
              <button 
                onClick={handleLogout} 
                className="inline-flex items-center gap-2 rounded-full border border-stone-200 dark:border-white/20 px-4 py-2 text-sm font-bold text-[var(--text-dark)] bg-white/50 dark:bg-white/10 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900/50 transition-all shadow-sm cursor-pointer"
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <Link 
              to="/login" 
              className="rounded-full bg-primary hover:bg-primary-hover px-6 py-2 text-sm font-bold text-white transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              Login
            </Link>
          )}
        </div>

        {/* TABLET/MOBILE ACTIONS */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 dark:border-white/10 bg-white/40 dark:bg-white/10 text-[var(--text-dark)] hover:bg-white/80 dark:hover:bg-white/20 transition-all shadow-sm shrink-0"
          >
            {theme === 'dark' ? <Moon size={15} /> : <Sun size={15} />}
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 dark:border-white/10 bg-white/40 dark:bg-white/10 text-[var(--text-dark)] hover:bg-white/80 dark:hover:bg-white/20 transition-all shadow-sm shrink-0"
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-[calc(100%-8px)] left-4 right-4 z-50">
          <div 
            className="p-5 rounded-2xl border shadow-lg flex flex-col gap-2 transition-all duration-300"
            style={{
              background: theme === 'dark' ? 'rgba(26, 22, 24, 0.98)' : 'rgba(253, 251, 247, 0.98)',
              borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(139, 38, 62, 0.08)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)'
            }}
          >
            <Link to="/venues" className={getMobileLinkClass('/venues')}>
              <span>Browse Venues</span>
            </Link>

            <Link to="/compare" className={getMobileLinkClass('/compare')}>
              <div className="flex items-center gap-2 justify-between w-full">
                <span className="flex items-center gap-2"><Scale size={16} /> Compare</span>
                {selectedVenues?.length > 0 && (
                  <span className="text-xs bg-primary text-white rounded-full px-2 py-0.5 font-bold">
                    {selectedVenues.length}
                  </span>
                )}
              </div>
            </Link>

            {isAuthenticated && (
              <Link to="/favorites" className={getMobileLinkClass('/favorites')}>
                <div className="flex items-center gap-2 justify-between w-full">
                  <span className="flex items-center gap-2"><Heart size={16} /> Favorites</span>
                  {favorites?.length > 0 && (
                    <span className="text-xs bg-primary text-white rounded-full px-2 py-0.5 font-bold">
                      {favorites.length}
                    </span>
                  )}
                </div>
              </Link>
            )}

            {isAuthenticated && (
              <Link to="/my-inquiries" className={getMobileLinkClass('/my-inquiries')}>
                <span>My Inquiries</span>
              </Link>
            )}

            {user?.role === 'organizer' && (
              <Link to="/inquiry-management" className={getMobileLinkClass('/inquiry-management')}>
                <span>Manage Inquiries</span>
              </Link>
            )}

            {(user?.role === 'organizer' || user?.role === 'admin') && (
              <Link to="/organizer-dashboard" className={getMobileLinkClass('/organizer-dashboard')}>
                <span className="flex items-center gap-2"><LayoutDashboard size={16} /> Dashboard</span>
              </Link>
            )}

            {user?.role === 'admin' && (
              <Link to="/admin" className={getMobileLinkClass('/admin')}>
                <span className="flex items-center gap-2"><Shield size={16} /> Admin</span>
              </Link>
            )}

            {/* Separator line */}
            <div className="h-px bg-stone-200 dark:bg-white/10 my-2" />

            {/* User Profile / Auth State on Mobile */}
            {isAuthenticated ? (
              <div className="flex flex-col gap-3 pt-1">
                <div className="flex items-center gap-3 px-2">
                  <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm shadow-sm select-none">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm text-[var(--text-dark)]">{user?.name}</span>
                    <span className="text-xs text-[var(--text-muted)] capitalize">{user?.role}</span>
                  </div>
                </div>
                <button 
                  onClick={handleLogout} 
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 dark:border-red-950/40 py-3 text-base font-bold text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-950/10 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer mt-1"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="w-full text-center rounded-xl bg-primary hover:bg-primary-hover py-3 text-base font-bold text-white transition-all shadow-md block mt-1 cursor-pointer"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
