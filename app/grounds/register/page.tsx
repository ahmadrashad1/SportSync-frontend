'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navbar';
import RegisterVenueForm from '@/components/RegisterVenueForm';
import { toast } from 'sonner';

export default function RegisterVenuePage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setIsLoggedIn(true);
      setUserId(storedUserId);
    } else {
      toast.error('Please login to register a venue');
      router.push('/login');
    }
  }, [router]);

  const handleSuccess = () => {
    toast.success('Venue registered successfully! Redirecting...');
    setTimeout(() => {
      router.push('/venues');
    }, 2000);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar isLoggedIn={false} setIsLoggedIn={setIsLoggedIn} />
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />

      <div className="pt-8 pb-16">
        <div className="max-w-3xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Register a Sports Venue</h1>
            <p className="text-gray-600">
              Add your sports complex or ground to SportSync and reach players across Islamabad and Rawalpindi
            </p>
          </div>

          {/* Form */}
          <RegisterVenueForm onSuccess={handleSuccess} />
        </div>
      </div>
    </div>
  );
}
