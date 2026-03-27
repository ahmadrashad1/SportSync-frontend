'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import { VenueMapMarker } from '@/lib/googleMapsUtils';
import { getApiBaseUrl } from '@/lib/apiBase';

const GroundMap = dynamic(() => import('@/components/GroundMap'), {
  ssr: false,
  loading: () => (
    <div className="h-96 flex items-center justify-center bg-gray-100">
      <p className="text-gray-500">Loading venue map...</p>
    </div>
  ),
});

interface VenueData {
  id: number;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  phoneNumber?: string;
  city: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function VenuesPage() {
  const [venues, setVenues] = useState<VenueData[]>([]);
  const [filteredVenues, setFilteredVenues] = useState<VenueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [selectedVenue, setSelectedVenue] = useState<VenueMapMarker | null>(null);

  useEffect(() => {
    fetchVenues();
  }, []);

  useEffect(() => {
    if (selectedCity === 'All') {
      setFilteredVenues(venues);
    } else {
      setFilteredVenues(
        venues.filter((v) => v.city.toLowerCase() === selectedCity.toLowerCase())
      );
    }
  }, [selectedCity, venues]);

  const fetchVenues = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${getApiBaseUrl()}/api/grounds/available`);

      if (!response.ok) {
        throw new Error('Failed to fetch venues');
      }

      const data = await response.json();
      setVenues(data);
      toast.success(`Loaded ${data.length} venues`);
    } catch (error) {
      console.error('Error fetching venues:', error);
      toast.error('Failed to load venues. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerClick = (venue: VenueMapMarker) => {
    setSelectedVenue(venue);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Discover Sports Venues</h1>
          <p className="text-gray-600">
            Find the perfect sports complex in Islamabad and Rawalpindi
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="text-sm font-medium text-gray-700 mr-3">Filter by City:</label>
            </div>
            {['All', 'Islamabad', 'Rawalpindi'].map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedCity === city
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredVenues.length} venue{filteredVenues.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">Venue Map</h2>
              </div>
              {loading ? (
                <div className="h-96 flex items-center justify-center bg-gray-100">
                  <p className="text-gray-500">Loading venue map...</p>
                </div>
              ) : (
                <GroundMap
                  venues={filteredVenues}
                  onMarkerClick={handleMarkerClick}
                  showCircleRadius={false}
                />
              )}
            </div>
          </div>

          {/* Venue List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg h-fit">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">
                  Venues ({filteredVenues.length})
                </h2>
              </div>
              <div className="overflow-y-auto max-h-96">
                {loading ? (
                  <div className="p-4 text-center text-gray-500">
                    Loading venues...
                  </div>
                ) : filteredVenues.length > 0 ? (
                  <div className="divide-y">
                    {filteredVenues.map((venue) => (
                      <div
                        key={venue.id}
                        onClick={() =>
                          handleMarkerClick({
                            id: venue.id,
                            name: venue.name,
                            address: venue.location,
                            latitude: venue.latitude,
                            longitude: venue.longitude,
                            phoneNumber: venue.phoneNumber,
                            city: venue.city,
                            description: venue.description,
                          })
                        }
                        className={`p-3 cursor-pointer transition ${
                          selectedVenue?.id === venue.id
                            ? 'bg-blue-50 border-l-4 border-blue-600'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <h3 className="font-semibold text-gray-800 text-sm">
                          {venue.name}
                        </h3>
                        <p className="text-xs text-gray-600 mt-1">
                          📍 {venue.location}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          🏙️ {venue.city}
                        </p>
                        {venue.phoneNumber && (
                          <p className="text-xs text-gray-500 mt-1">
                            📞 {venue.phoneNumber}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No venues found in {selectedCity}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Selected Venue Details */}
        {selectedVenue && (
          <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {selectedVenue.name}
                </h2>
                <div className="space-y-2 text-gray-600">
                  <p>📍 {selectedVenue.address}</p>
                  <p>🏙️ {selectedVenue.city}</p>
                  {selectedVenue.phoneNumber && (
                    <p>📞 {selectedVenue.phoneNumber}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    Coordinates: {selectedVenue.latitude.toFixed(4)}, {selectedVenue.longitude.toFixed(4)}
                  </p>
                </div>
              </div>
              <a
                href={`https://www.google.com/maps/search/${encodeURIComponent(
                  selectedVenue.name
                )}/@${selectedVenue.latitude},${selectedVenue.longitude},15z`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
              >
                Open in Google Maps
              </a>
            </div>
            {selectedVenue.description && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">{selectedVenue.description}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
