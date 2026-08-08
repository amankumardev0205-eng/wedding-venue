import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { handleImageError } from '../utils/imageUtils';

// Helper to update map view dynamically when centers or bounds change
function MapUpdater({ center, bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    } else if (center) {
      map.setView(center, map.getZoom() || 13);
    }
  }, [center, bounds, map]);
  return null;
}

// Helper to listen to map clicks and bubble coordinates back to search filters
function MapClickEventHandler({ onClick }) {
  useMapEvents({
    click: (e) => {
      if (onClick) {
        onClick(e.latlng);
      }
    }
  });
  return null;
}

// Helper to manage programmatic popups and smooth panning on card hover
function MapInteractionHandler({ hoveredVenueId, markerRefs, markers }) {
  const map = useMap();

  useEffect(() => {
    if (hoveredVenueId && markerRefs.current[hoveredVenueId]) {
      const markerInstance = markerRefs.current[hoveredVenueId];
      if (markerInstance) {
        markerInstance.openPopup();
        const targetMarker = markers.find(m => (m.venue._id || m.venue.id) === hoveredVenueId);
        if (targetMarker && targetMarker.position) {
          map.panTo(targetMarker.position, { animate: true, duration: 0.6 });
        }
      }
    }
  }, [hoveredVenueId, markerRefs, markers, map]);

  return null;
}

// Create a custom Tailwind-styled Leaflet Marker Icon matching the peach/pink theme
const createCustomMarker = (name, isHovered = false) => {
  const pinClass = isHovered 
    ? 'w-10 h-10 rounded-full bg-[#cf5577] border-2 border-rose-200 flex items-center justify-center shadow-2xl transition-all duration-300 scale-125 z-[9999]'
    : 'w-8 h-8 rounded-full bg-[#e86f8f] border-2 border-white flex items-center justify-center shadow-lg transition-transform duration-200 hover:scale-110';
  const glowClass = isHovered
    ? 'absolute w-12 h-12 rounded-full bg-[#cf5577]/40 animate-ping'
    : 'absolute w-8 h-8 rounded-full bg-[#e86f8f]/30 animate-ping';
  const heartSize = isHovered ? '16' : '14';

  return L.divIcon({
    className: `custom-leaflet-marker ${isHovered ? 'z-[9999]' : ''}`,
    html: `
      <div class="group relative flex items-center justify-center">
        <!-- Pulsing locator glow -->
        <div class="${glowClass}"></div>
        <!-- Main Heart Marker Pin -->
        <div class="${pinClass}">
          <svg xmlns="http://www.w3.org/2000/svg" width="${heartSize}" height="${heartSize}" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
        </div>
        <!-- Tooltip Label on hover -->
        <div class="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-[1000]">
          <div class="bg-slate-900/90 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded shadow-md whitespace-nowrap">
            ${name}
          </div>
          <div class="w-2 h-2 bg-slate-900/90 rotate-45 -mt-1"></div>
        </div>
      </div>
    `,
    iconSize: isHovered ? [40, 40] : [32, 32],
    iconAnchor: isHovered ? [20, 20] : [16, 16],
    popupAnchor: [0, isHovered ? -20 : -16]
  });
};

// Robust coordinates parsing utility
const getCoords = (venue) => {
  const coords = venue.coordinates || venue.location || null;
  if (!coords) return null;
  if (Array.isArray(coords) && coords.length >= 2) {
    const lat = parseFloat(coords[0]);
    const lng = parseFloat(coords[1]);
    return (!isNaN(lat) && !isNaN(lng)) ? [lat, lng] : null;
  }
  if (coords.lat != null && coords.lng != null) {
    const lat = parseFloat(coords.lat);
    const lng = parseFloat(coords.lng);
    return (!isNaN(lat) && !isNaN(lng)) ? [lat, lng] : null;
  }
  if (coords.latitude != null && coords.longitude != null) {
    const lat = parseFloat(coords.latitude);
    const lng = parseFloat(coords.longitude);
    return (!isNaN(lat) && !isNaN(lng)) ? [lat, lng] : null;
  }
  return null;
};

export default function VenueMap({
  venues = [],
  hoveredVenueId = null,
  center = null,
  zoom = 13,
  singleVenueMode = false,
  onMapClick = null,
  searchCenter = null,
  searchRadius = null
}) {
  const markerRefs = React.useRef({});
  // Parse coordinate positions for markers
  const markers = venues
    .map(v => ({ venue: v, position: getCoords(v) }))
    .filter(m => m.position !== null);

  // Compute map bounding box if multiple markers exist
  let bounds = [];
  if (markers.length > 1 && !singleVenueMode) {
    bounds = markers.map(m => m.position);
  }

  // Determine starting map center coordinates (prefer active search center)
  let mapCenter = [28.6139, 77.2090]; // Default: New Delhi, India
  if (searchCenter) {
    mapCenter = searchCenter;
  } else if (center) {
    mapCenter = center;
  } else if (markers.length > 0) {
    mapCenter = markers[0].position;
  }

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden shadow-md border border-[var(--border-light)] clay-card z-10 min-h-[350px]">
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapUpdater center={mapCenter} bounds={bounds} />

        {onMapClick && <MapClickEventHandler onClick={onMapClick} />}

        <MapInteractionHandler
          hoveredVenueId={hoveredVenueId}
          markerRefs={markerRefs}
          markers={markers}
        />

        {searchCenter && (
          <Marker
            position={searchCenter}
            icon={L.divIcon({
              className: 'search-center-marker',
              html: `
                <div class="relative flex items-center justify-center">
                  <!-- Radar pulse -->
                  <div class="absolute w-10 h-10 rounded-full bg-blue-500/25 animate-ping"></div>
                  <!-- Marker Pin -->
                  <div class="w-6 h-6 rounded-full bg-blue-500 border-2 border-white shadow-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
                  </div>
                </div>
              `,
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            })}
          >
            <Popup>
              <div class="p-1.5 text-center font-sans text-xs">
                <p class="font-bold text-slate-800">Your Search Location</p>
                <p class="text-slate-500 mt-0.5">${searchRadius ? `Radius: ${searchRadius} km` : ''}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {searchCenter && searchRadius && (
          <Circle
            center={searchCenter}
            radius={searchRadius * 1000}
            pathOptions={{
              color: '#e86f8f',
              fillColor: '#e86f8f',
              fillOpacity: 0.12,
              weight: 1.5,
              dashArray: '5, 5'
            }}
          />
        )}

        {markers.map(({ venue, position }) => {
          const isHovered = hoveredVenueId === (venue._id || venue.id);
          return (
            <Marker
              key={venue.id || venue._id}
              position={position}
              ref={(el) => {
                if (el) {
                  markerRefs.current[venue._id || venue.id] = el;
                }
              }}
              icon={createCustomMarker(venue.name, isHovered)}
              eventHandlers={{
                click: () => {
                  const cardElement = document.getElementById(`venue-card-${venue._id || venue.id}`);
                  if (cardElement) {
                    cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    cardElement.classList.add('ring-4', 'ring-[#e86f8f]', 'ring-offset-2', 'transition-all', 'duration-300');
                    setTimeout(() => {
                      cardElement.classList.remove('ring-4', 'ring-[#e86f8f]', 'ring-offset-2');
                    }, 1500);
                  }
                },
                mouseover: (e) => {
                  e.target.openPopup();
                }
              }}
            >
              <Popup className="custom-leaflet-popup">
                <div className="p-2 font-sans w-[220px]">
                  {venue.images && venue.images[0] && (
                    <img
                      src={venue.images[0].url}
                      alt={venue.name}
                      className="w-full h-[110px] object-cover rounded-lg mb-2"
                      onError={handleImageError}
                    />
                  )}
                  <h4 className="font-bold text-sm text-[var(--text-dark)] leading-tight mb-1 truncate">
                    {venue.name}
                  </h4>
                  <p className="text-xs text-[var(--text-muted)] capitalize mb-2">
                    {venue.city}
                  </p>
                  <div className="flex justify-between items-center text-xs border-t border-[var(--border-light)] pt-2">
                    <div>
                      <span className="font-bold text-[#cf5577]">
                        {venue.pricing?.perPlate ? `₹${venue.pricing.perPlate}/pl` : `₹${venue.pricing?.flatRate}/flat`}
                      </span>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)] font-medium">
                        Cap: {venue.capacity?.max}
                      </span>
                    </div>
                  </div>
                  <Link
                    to={`/venues/${venue.id || venue._id}`}
                    className="mt-3 block text-center bg-[#e86f8f] hover:bg-[#cf5577] text-white text-xs font-bold py-2 px-3 rounded-lg transition"
                  >
                    View Details
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
