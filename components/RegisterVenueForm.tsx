'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import { TWIN_CITIES_CENTER } from '@/lib/googleMapsUtils';

// Dynamically import the map component to prevent server-side Leaflet initialization
const VenueMap = dynamic(() => import('./VenueMap').then(mod => ({ default: mod.VenueMap })), {
  loading: () => (
    <div className="w-full h-96 rounded-lg overflow-hidden border border-gray-300 bg-gray-100 flex items-center justify-center">
      <p className="text-gray-500">Loading map...</p>
    </div>
  ),
  ssr: false,
});

interface RegisterVenueFormProps {
  onSuccess?: () => void;
}

const RegisterVenueForm: React.FC<RegisterVenueFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    phoneNumber: '',
    city: 'Islamabad',
    latitude: TWIN_CITIES_CENTER.lat,
    longitude: TWIN_CITIES_CENTER.lng,
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'latitude' || name === 'longitude' ? parseFloat(value) : value,
    }));
  };

  const handleMapClick = (lat: number, lng: number) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));
    toast.success('Location updated from map');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/grounds/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to register venue');
      }

      const data = await response.json();
      toast.success(data.message || 'Venue registered successfully!');

      // Reset form
      setFormData({
        name: '',
        location: '',
        description: '',
        phoneNumber: '',
        city: 'Islamabad',
        latitude: TWIN_CITIES_CENTER.lat,
        longitude: TWIN_CITIES_CENTER.lng,
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error registering venue:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to register venue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Register New Venue</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Venue Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Venue Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g., Cricket Ground Main"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Location Address *
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            placeholder="e.g., G-5 Sports Complex, Islamabad"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* City Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              City *
            </label>
            <select
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Islamabad">Islamabad</option>
              <option value="Rawalpindi">Rawalpindi</option>
            </select>
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="+92-300-1234567"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe the venue facilities, amenities, etc."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Coordinates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
              Latitude *
            </label>
            <input
              type="number"
              id="latitude"
              name="latitude"
              value={formData.latitude}
              onChange={handleInputChange}
              step="0.0001"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">
              Longitude *
            </label>
            <input
              type="number"
              id="longitude"
              name="longitude"
              value={formData.longitude}
              onChange={handleInputChange}
              step="0.0001"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Map Instruction */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            💡 Tip: Click on the map below to select the venue location, or enter coordinates manually.
          </p>
        </div>

        {/* Interactive Map */}
        <VenueMap 
          latitude={formData.latitude} 
          longitude={formData.longitude} 
          onMapClick={handleMapClick} 
        />

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            {loading ? 'Registering Venue...' : 'Register Venue'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterVenueForm;
