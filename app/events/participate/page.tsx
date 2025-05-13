"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Calendar, Clock, Users, CheckCircle } from "lucide-react";
import { FloatingPaper } from "@/components/floating-paper";
import Navbar from "@/components/navbar";
import { Skeleton } from "@/components/ui/skeleton";

export default function ParticipateEventsPage() {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  // Add state to track registered events
  const [registeredEvents, setRegisteredEvents] = useState([]);

  // Add function to fetch registered events
  const fetchRegisteredEvents = async (userId) => {
    try {
      const response = await fetch(
        `http://localhost:8080/participants/user/${userId}`
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Registered events:", data);
        setRegisteredEvents(data);
      } else {
        console.warn(
          "Could not fetch registered events. Status:",
          response.status
        );
      }
    } catch (err) {
      console.error("Error fetching registered events:", err);
      // Don't set error here as this is not critical for the page to function
    }
  };

  // Update useEffect to fetch registered events
  useEffect(() => {
    // Check if user is logged in
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
      setIsLoggedIn(true);
      fetchEvents(storedUserId);
      fetchRegisteredEvents(storedUserId);
    } else {
      router.push("/login");
    }
  }, [router]);

  // Add function to check if user is registered for an event
  const isEventRegistered = (eventId) => {
    return registeredEvents.some((reg) => reg.eventId === eventId);
  };

  const fetchEvents = async (userId) => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:8080/api/events/allexceptmine/${userId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }

      const data = await response.json();
      console.log("Available events:", data);
      setEvents(data);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return "N/A";
    const date = new Date(dateTimeStr);
    return date.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50 antialiased bg-grid-blue/[0.02]">
      {/* Floating papers background */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <FloatingPaper count={6} />
      </div>

      <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Participate in Events</h1>
        </div>

        {error && (
          <Alert
            variant="destructive"
            className="mb-6 bg-red-50 border-red-200 text-red-800"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-white shadow-md">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : events.length === 0 ? (
          <Card className="bg-white shadow-md">
            <CardContent className="flex flex-col items-center justify-center h-64">
              <Calendar className="h-16 w-16 text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">
                No events available for participation
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card
                key={`event-${event.id}`}
                className={`bg-white shadow-md hover:shadow-lg transition-shadow ${
                  isEventRegistered(event.id) ? "border-green-500" : ""
                }`}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>{event.name}</CardTitle>
                    {isEventRegistered(event.id) && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <CardDescription className="line-clamp-2">
                    {event.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2 text-primary" />
                    <span>Start: {formatDateTime(event.startTime)}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-2 text-primary" />
                    <span>End: {formatDateTime(event.endTime)}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-primary hover:bg-blue-700 text-white"
                    onClick={() =>
                      router.push(`/events/participate/${event.id}`)
                    }
                    disabled={isEventRegistered(event.id)}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    {isEventRegistered(event.id)
                      ? "Already Registered"
                      : "View Sub-Events"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
