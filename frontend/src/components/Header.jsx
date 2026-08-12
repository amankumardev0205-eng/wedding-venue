import React, { useContext, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, LayoutDashboard, LogOut, Moon, Scale, Shield, Sun } from 'lucide-react';
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

  const getLinkClass = (path) => {
    const isActive = location.pathname === path;
    return `text-xs md:text-sm font-semibold transition px-3 py-1.5 rounded-full ${
      isActive 
        ? 'text-[#E85D83] dark:text-[#F06D91] bg-[#E85D83]/10 dark:bg-white/10 shadow-sm'
        : 'text-[#292524] dark:text-[#FFF7F5] hover:text-[#E85D83] dark:hover:text-[#F06D91]'
    }`;
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="sticky top-0 w-full px-4 py-2 z-50 transition-all duration-300">
      <div 
        className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 md:px-6 py-2 rounded-2xl md:rounded-full border shadow-md transition-all duration-300"
        style={{
          background: theme === 'dark' ? 'rgba(33, 28, 31, 0.85)' : 'rgba(255, 255, 255, 0.80)',
          borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.10)' : 'rgba(229, 231, 235, 0.80)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)'
        }}
      >
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-base font-extrabold tracking-normal transition shadow-sm border border-[#E5E7EB] dark:border-white/15 bg-white/50 dark:bg-white/10 text-[#292524] dark:text-[#FFF7F5]"
        >
          <Heart size={16} className="fill-[#E85D83] text-[#E85D83] dark:fill-[#F06D91] dark:text-[#F06D91]" />
          <span>WedVenue</span>
        </Link>

        <nav className="flex flex-1 flex-wrap items-center justify-end gap-2 md:gap-3">
          <Link to="/venues" className={getLinkClass('/venues')}>Venues</Link>
          <Link to="/compare" className={`${getLinkClass('/compare')} inline-flex items-center gap-1`}>
            <Scale size={14} />
            Compare{selectedVenues?.length ? ` (${selectedVenues.length})` : ''}
          </Link>
          {isAuthenticated && (
            <Link to="/favorites" className={`${getLinkClass('/favorites')} inline-flex items-center gap-1`}>
              <Heart size={14} />
              Favorites{favorites?.length ? ` (${favorites.length})` : ''}
            </Link>
          )}
          {isAuthenticated && <Link to="/my-inquiries" className={getLinkClass('/my-inquiries')}>Inquiries</Link>}
          {user?.role === 'organizer' && (
            <Link to="/inquiry-management" className={getLinkClass('/inquiry-management')}>
              Manage Inquiries
            </Link>
          )}
          {(user?.role === 'organizer' || user?.role === 'admin') && (
            <Link to="/organizer-dashboard" className={`${getLinkClass('/organizer-dashboard')} inline-flex items-center gap-1`}>
              <LayoutDashboard size={14} />
              Dashboard
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin" className={`${getLinkClass('/admin')} inline-flex items-center gap-1`}>
              <Shield size={14} />
              Admin
            </Link>
          )}
          {isAuthenticated ? (
            <button 
              onClick={handleLogout} 
              className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] dark:border-white/20 px-4 py-1.5 text-xs font-bold text-[#292524] dark:text-white bg-white/40 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/20 transition shadow-sm"
            >
              <LogOut size={14} />
              Logout
            </button>
          ) : (
            <Link to="/login" className="rounded-full bg-[#E85D83] hover:bg-[#C43C62] px-5 py-1.5 text-xs font-bold text-white transition shadow-sm">Login</Link>
          )}

          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#E5E7EB] dark:border-white/20 bg-white/40 dark:bg-white/10 text-[#292524] dark:text-white hover:bg-white/80 dark:hover:bg-white/30 transition-all shadow-sm shrink-0"
          >
            {theme === 'dark' ? <Moon size={16} className="rotate-0 transition-transform duration-300" /> : <Sun size={16} className="rotate-360 transition-transform duration-300" />}
          </button>
        </nav>
      </div>
    </header>
  );
}
