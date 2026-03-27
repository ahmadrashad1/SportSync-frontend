// Leaflet/OpenStreetMap Utility for SportSync
// Using FREE OpenStreetMap tiles (no API key required)

export interface VenueMapMarker {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phoneNumber?: string;
  city: string;
  description?: string;
}

export interface MapBounds {
  ne: { lat: number; lng: number };
  sw: { lat: number; lng: number };
}

// Twin Cities Center
export const TWIN_CITIES_CENTER = {
  lat: 33.6844,
  lng: 73.0479,
};

// Map zoom level defaults
export const MAP_ZOOM = {
  WORLD: 2,
  DEFAULT: 12,
  CITY: 14,
  STREET: 16,
};

// Marker colors by city (CSS colors for Leaflet)
export const CITY_COLORS = {
  Islamabad: '#3498db',  // Blue
  Rawalpindi: '#e74c3c', // Red
};

// Convert venue data to map marker format
export const convertVenuesToMarkers = (
  venues: any[]
): VenueMapMarker[] => {
  return venues.map((venue) => ({
    id: venue.id,
    name: venue.name,
    address: venue.location,
    latitude: venue.latitude,
    longitude: venue.longitude,
    phoneNumber: venue.phoneNumber,
    city: venue.city,
    description: venue.description,
  }));
};

// Calculate distance between two coordinates (Haversine formula - in kilometers)
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};

// Format distance for display
export const formatDistance = (distanceKm: number): string => {
  if (distanceKm < 1) {
    return `${(distanceKm * 1000).toFixed(0)}m`;
  }
  return `${distanceKm.toFixed(1)}km`;
};

// Filter venues by proximity
export const filterByProximity = (
  venues: VenueMapMarker[],
  lat: number,
  lng: number,
  radiusKm: number
): VenueMapMarker[] => {
  return venues.filter(
    (venue) =>
      calculateDistance(lat, lng, venue.latitude, venue.longitude) <=
      radiusKm
  );
};

// Generate OpenStreetMap search URL
export const generateOpenStreetMapUrl = (
  latitude: number,
  longitude: number,
  venueName: string
): string => {
  return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=16&layers=M`;
};

// Get marker color by city
export const getMarkerColorByCity = (city: string): string => {
  return CITY_COLORS[city as keyof typeof CITY_COLORS] || '#2ecc71';
};

// Generate marker SVG icon
export const createMarkerIcon = (color: string, label: string) => {
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 40" width="32" height="40">
      <path d="M16,0 C8,0 2,6 2,14 C2,25 16,40 16,40 C16,40 30,25 30,14 C30,6 24,0 16,0 Z" fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="16" cy="14" r="5" fill="white"/>
      <text x="16" y="32" text-anchor="middle" font-size="10" font-weight="bold" fill="white">${label}</text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${Buffer.from(svgString).toString('base64')}`;
};

// OpenStreetMap tile provider URL
export const OPENSTREETMAP_TILES = {
  url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '© OpenStreetMap contributors',
  maxZoom: 19,
};

// Alternative tile providers (all free)
export const TILE_PROVIDERS = {
  openstreetmap: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19,
    label: 'OpenStreetMap',
  },
  tonerLite: {
    url: 'https://tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors',
    maxZoom: 18,
    label: 'OSM DE',
  },
  stamenTonerLite: {
    url: 'https://tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '© OpenTopoMap contributors',
    maxZoom: 17,
    label: 'OpenTopoMap',
  },
};
