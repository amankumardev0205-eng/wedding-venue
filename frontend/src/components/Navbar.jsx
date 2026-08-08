import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../redux/authSlice';
import { Heart, Scale, Shield, LayoutDashboard, Menu, X } from 'lucide-react';

export default function Navbar() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { favorites } = useSelector((state) => state.favorites);
  const { selectedVenues } = useSelector((state) => state.compare);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    setIsOpen(false);
    navigate('/login');
  };

  const handleNavClick = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-rose-100 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* LOGO */}
        <button onClick={() => handleNavClick('/')} className="flex items-center gap-2 group bg-transparent border-none cursor-pointer">
          <Heart className="text-rose-400 fill-rose-100 group-hover:scale-110 transition-transform" size={28} />
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-slate-900">Wed</span>
            <span className="text-rose-400">Venue</span>
          </h1>
        </button>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center gap-6 md:gap-8 font-medium text-sm md:text-base text-gray-500">
          {isAuthenticated ? (
            <>
              <button onClick={() => handleNavClick('/venues')} className="hover:text-rose-400 transition-all duration-300 text-left bg-transparent border-none cursor-pointer font-medium text-gray-500">
                Browse Venues
              </button>
              <button onClick={() => handleNavClick('/my-inquiries')} className="hover:text-rose-400 transition-all duration-300 text-left bg-transparent border-none cursor-pointer font-medium text-gray-500">
                My Inquiries
              </button>
              <button onClick={() => handleNavClick('/favorites')} className="flex items-center gap-1 hover:text-rose-400 transition-all duration-300 bg-transparent border-none cursor-pointer font-medium text-gray-500">
                <Heart size={16} />
                Favorites {favorites.length > 0 && `(${favorites.length})`}
              </button>
              <button onClick={() => handleNavClick('/compare')} className="flex items-center gap-1 hover:text-rose-400 transition-all duration-300 bg-transparent border-none cursor-pointer font-medium text-gray-500">
                <Scale size={16} />
                Compare {selectedVenues.length > 0 && `(${selectedVenues.length})`}
              </button>
              
              {user?.role === 'organizer' && (
                <>
                  <button onClick={() => handleNavClick('/organizer-dashboard')} className="flex items-center gap-1 text-rose-500 hover:text-rose-600 transition-all font-semibold bg-transparent border-none cursor-pointer">
                    <LayoutDashboard size={16} /> Dashboard
                  </button>
                  <button onClick={() => handleNavClick('/inquiry-management')} className="text-rose-500 hover:text-rose-600 transition-all font-semibold bg-transparent border-none cursor-pointer">
                    Manage Inquiries
                  </button>
                </>
              )}
              {user?.role === 'admin' && (
                <button onClick={() => handleNavClick('/admin')} className="hover:text-rose-400 transition-all duration-300 flex items-center gap-1 bg-transparent border-none cursor-pointer font-medium text-gray-500">
                  <Shield size={16} />
                  Admin
                </button>
              )}
              
              <div className="flex items-center border-l border-rose-100 pl-6 gap-3">
                <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-400 font-semibold text-sm">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="font-medium text-slate-700">{user?.name}</span>
              </div>

              <button onClick={handleLogout} className="px-4 py-1.5 rounded-xl border border-rose-200 text-rose-400 hover:bg-rose-50 transition-all duration-300 text-sm font-medium cursor-pointer">
                Logout
              </button>
            </>
          ) : (
            <>
              <button onClick={() => handleNavClick('/login')} className="hover:text-rose-400 transition-all duration-300 bg-transparent border-none cursor-pointer font-medium text-gray-500">
                Login
              </button>
              <button onClick={() => handleNavClick('/register')} className="px-5 py-2 bg-gradient-to-r from-rose-400 to-pink-400 text-white rounded-xl hover:scale-105 transition-all shadow-sm cursor-pointer border-none font-medium">
                Register
              </button>
            </>
          )}
        </div>

        {/* MOBILE HAMBURGER BUTTON */}
        <div className="flex md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-500 hover:text-rose-400 focus:outline-none transition-colors bg-transparent border-none cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* MOBILE COLLAPSIBLE DRAWER */}
      {isOpen && (
        <div className="md:hidden border-t border-rose-50 bg-white/95 px-6 py-4 flex flex-col gap-4 font-medium text-gray-500 shadow-inner">
          {isAuthenticated ? (
            <>
              <button onClick={() => handleNavClick('/venues')} className="hover:text-rose-400 transition-all py-2 text-left border-b border-rose-50/50 bg-transparent border-none cursor-pointer font-medium text-gray-500 w-full">
                Browse Venues
              </button>
              <button onClick={() => handleNavClick('/my-inquiries')} className="hover:text-rose-400 transition-all py-2 text-left border-b border-rose-50/50 bg-transparent border-none cursor-pointer font-medium text-gray-500 w-full">
                My Inquiries
              </button>
              <button onClick={() => handleNavClick('/favorites')} className="flex items-center gap-2 hover:text-rose-400 transition-all py-2 border-b border-rose-50/50 bg-transparent border-none cursor-pointer font-medium text-gray-500 w-full">
                <Heart size={16} />
                <span>Favorites {favorites.length > 0 && `(${favorites.length})`}</span>
              </button>
              <button onClick={() => handleNavClick('/compare')} className="flex items-center gap-2 hover:text-rose-400 transition-all py-2 border-b border-rose-50/50 bg-transparent border-none cursor-pointer font-medium text-gray-500 w-full">
                <Scale size={16} />
                <span>Compare {selectedVenues.length > 0 && `(${selectedVenues.length})`}</span>
              </button>
              
              {user?.role === 'organizer' && (
                <>
                  <button onClick={() => handleNavClick('/organizer-dashboard')} className="flex items-center gap-2 text-rose-500 hover:text-rose-600 transition-all py-2 border-b border-rose-50/50 font-semibold bg-transparent border-none cursor-pointer w-full text-left">
                    <LayoutDashboard size={16} /> Dashboard
                  </button>
                  <button onClick={() => handleNavClick('/inquiry-management')} className="text-rose-500 hover:text-rose-600 transition-all py-2 text-left border-b border-rose-50/50 font-semibold bg-transparent border-none cursor-pointer w-full">
                    Manage Inquiries
                  </button>
                </>
              )}
              {user?.role === 'admin' && (
                <button onClick={() => handleNavClick('/admin')} className="hover:text-rose-400 transition-all py-2 flex items-center gap-2 border-b border-rose-50/50 bg-transparent border-none cursor-pointer font-medium text-gray-500 w-full text-left">
                  <Shield size={16} />
                  <span>Admin</span>
                </button>
              )}
              
              <div className="flex items-center gap-3 py-2">
                <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-400 font-semibold text-sm">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="font-semibold text-slate-700">{user?.name}</span>
              </div>

              <button onClick={handleLogout} className="w-full text-center px-4 py-2.5 rounded-xl border border-rose-200 text-rose-400 hover:bg-rose-50 transition-all font-semibold mt-2 cursor-pointer bg-transparent">
                Logout
              </button>
            </>
          ) : (
            <>
              <button onClick={() => handleNavClick('/login')} className="hover:text-rose-400 transition-all py-2 text-left border-b border-rose-50/50 bg-transparent border-none cursor-pointer font-medium text-gray-500 w-full">
                Login
              </button>
              <button onClick={() => handleNavClick('/register')} className="w-full text-center px-5 py-2.5 bg-gradient-to-r from-rose-400 to-pink-400 text-white rounded-xl hover:scale-101 transition-all shadow-sm font-semibold mt-2 cursor-pointer border-none">
                Register
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
