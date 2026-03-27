'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  Circle,
} from 'react-leaflet';
import L from 'leaflet';
import {
  convertVenuesToMarkers,
  VenueMapMarker,
  TWIN_CITIES_CENTER,
  getMarkerColorByCity,
  OPENSTREETMAP_TILES,
} from '@/lib/googleMapsUtils';
import 'leaflet/dist/leaflet.css';

interface GroundMapProps {
  venues?: any[];
  onMarkerClick?: (venue: VenueMapMarker) => void;
  showCircleRadius?: boolean;
  radiusKm?: number;
  centerLat?: number;
  centerLng?: number;
}

const GroundMap: React.FC<GroundMapProps> = ({
  venues = [],
  onMarkerClick,
  showCircleRadius = false,
  radiusKm = 5,
  centerLat = TWIN_CITIES_CENTER.lat,
  centerLng = TWIN_CITIES_CENTER.lng,
}) => {
  const [markers, setMarkers] = useState<VenueMapMarker[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<VenueMapMarker | null>(
    null
  );
  const [isMounted, setIsMounted] = useState(false);

  const mountedRef = useRef(false);
  const [canRender, setCanRender] = useState(false);

  useEffect(() => {
    setMarkers(convertVenuesToMarkers(venues));
  }, [venues]);

  useEffect(() => {
    // Only set mounted once, never reset
    if (!mountedRef.current) {
      mountedRef.current = true;
      setCanRender(true);
    }
  }, []);

  const handleMarkerClick = (marker: VenueMapMarker) => {
    setSelectedMarker(marker);
    if (onMarkerClick) {
      onMarkerClick(marker);
    }
  };

  const createCustomIcon = (city: string) => {
    const color = getMarkerColorByCity(city);
    return L.icon({
      iconUrl: `data:image/svg+xml;base64,${Buffer.from(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 40" width="32" height="40">
          <path d="M16,0 C8,0 2,6 2,14 C2,25 16,40 16,40 C16,40 30,25 30,14 C30,6 24,0 16,0 Z" fill="${color}" stroke="white" stroke-width="2"/>
          <circle cx="16" cy="14" r="5" fill="white"/>
        </svg>
      `).toString('base64')}`,
      iconSize: [32, 40],
      iconAnchor: [16, 40],
      popupAnchor: [0, -40],
      shadowUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      shadowSize: [41, 41],
      shadowAnchor: [13, 41],
    });
  };

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden border border-gray-300">
      {!canRender ? (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
          <p className="text-gray-500">Loading map...</p>
        </div>
      ) : (
        <MapContainer
          center={[centerLat, centerLng]}
          zoom={12}
          className="w-full h-full"
                  key="ground-map"
        >
          <TileLayer
            url={OPENSTREETMAP_TILES.url}
            attribution={OPENSTREETMAP_TILES.attribution}
            maxZoom={OPENSTREETMAP_TILES.maxZoom}
          />

          {/* Search Radius Circle */}
          {showCircleRadius && (
            <Circle
              center={[centerLat, centerLng]}
              radius={radiusKm * 1000} // Convert km to meters
              pathOptions={{
                color: '#4285F4',
                fillColor: '#4285F4',
                fillOpacity: 0.15,
                weight: 2,
              }}
            />
          )}

          {/* Venue Markers */}
          {markers.map((marker) => (
            <Marker
              key={marker.id}
              position={[marker.latitude, marker.longitude]}
              icon={createCustomIcon(marker.city)}
              eventHandlers={{
                click: () => handleMarkerClick(marker),
              }}
            >
              <Popup className="max-w-xs">
                <div className="w-64 p-3">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {marker.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    📍 {marker.address}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    🏙️ {marker.city}
                  </p>
                  {marker.phoneNumber && (
                    <p className="text-sm text-gray-600 mb-2">
                      📞 {marker.phoneNumber}
                    </p>
                  )}
                  {marker.description && (
                    <p className="text-xs text-gray-500 mb-3">
                      {marker.description}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <a
                      href={`https://www.openstreetmap.org/?mlat=${marker.latitude}&mlon=${marker.longitude}&zoom=16`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                    >
                      View on OSM
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
    </div>
  );
};

export default GroundMap;
