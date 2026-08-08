import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-100 bg-white/60 backdrop-blur-md mt-12">
      <div className="max-w-7xl mx-auto py-8 px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-600">© {new Date().getFullYear()} WedVenue — All rights reserved.</div>
        <div className="flex items-center gap-4">
          <Link to="/" className="text-sm text-gray-600 hover:text-gray-900">Home</Link>
          <Link to="/venues" className="text-sm text-gray-600 hover:text-gray-900">Venues</Link>
          <Link to="/contact" className="text-sm text-gray-600 hover:text-gray-900">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
