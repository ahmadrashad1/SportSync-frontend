'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { TWIN_CITIES_CENTER, OPENSTREETMAP_TILES } from '@/lib/googleMapsUtils';
import 'leaflet/dist/leaflet.css';

interface VenueMapProps {
  latitude: number;
  longitude: number;
  onMapClick: (lat: number, lng: number) => void;
}

export const VenueMap: React.FC<VenueMapProps> = ({ latitude, longitude, onMapClick }) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.CircleMarker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current).setView(
      [TWIN_CITIES_CENTER.lat, TWIN_CITIES_CENTER.lng],
      14
    );

    L.tileLayer(OPENSTREETMAP_TILES.url, {
      attribution: OPENSTREETMAP_TILES.attribution,
      maxZoom: OPENSTREETMAP_TILES.maxZoom,
    }).addTo(map);

    const marker = L.circleMarker([latitude, longitude], {
      radius: 8,
      color: '#2563eb',
      fillColor: '#2563eb',
      fillOpacity: 0.8,
      weight: 2,
    }).addTo(map);

    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      onMapClick(lat, lng);
    });

    mapRef.current = map;
    markerRef.current = marker;

    return () => {
      map.off();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [onMapClick]);

  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;

    markerRef.current.setLatLng([latitude, longitude]);
    mapRef.current.setView([latitude, longitude], mapRef.current.getZoom());
  }, [latitude, longitude]);

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden border border-gray-300">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};
