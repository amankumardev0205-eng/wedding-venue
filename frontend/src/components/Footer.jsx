import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="w-full border-t border-[var(--border-light)] bg-white/40 dark:bg-[#1A1618]/40 backdrop-blur-md mt-16 transition-all duration-300">
      <div className="max-w-6xl mx-auto py-10 px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-sm text-[var(--text-muted)] font-medium">
          © {new Date().getFullYear()} WedVenue — All rights reserved.
        </div>
        <div className="flex items-center gap-6">
          <Link 
            to="/" 
            className="text-sm text-[var(--text-muted)] hover:text-primary transition-colors duration-200 font-medium focus-visible:text-primary"
          >
            Home
          </Link>
          <Link 
            to="/venues" 
            className="text-sm text-[var(--text-muted)] hover:text-primary transition-colors duration-200 font-medium focus-visible:text-primary"
          >
            Venues
          </Link>
          <Link 
            to="/compare" 
            className="text-sm text-[var(--text-muted)] hover:text-primary transition-colors duration-200 font-medium focus-visible:text-primary"
          >
            Compare
          </Link>
        </div>
      </div>
    </footer>
  );
}
