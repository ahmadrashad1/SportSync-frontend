"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
import {
  AlertCircle,
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { FloatingPaper } from "@/components/floating-paper";
import Navbar from "@/components/navbar";
import { Badge } from "@/components/ui/badge";

export default function EventSubEventsPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id;

  const [userId, setUserId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [event, setEvent] = useState(null);
  const [subEvents, setSubEvents] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [registeringSubEventId, setRegisteringSubEventId] = useState(null);
  const [debugInfo, setDebugInfo] = useState("");

  useEffect(() => {
    // Check if user is logged in
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
      setIsLoggedIn(true);

      // Fetch event details and sub-events
      fetchEventDetails(eventId, storedUserId);
    } else {
      router.push("/login");
    }
  }, [router, eventId]);

  const fetchEventDetails = async (eventId, userId) => {
    try {
      // Fetch event details
      const eventsResponse = await fetch(
        `http://localhost:8080/api/events/allexceptmine/${userId}`
      );
      if (!eventsResponse.ok) {
        throw new Error(
          `Failed to fetch events. Status: ${eventsResponse.status}`
        );
      }

      const events = await eventsResponse.json();
      const event = events.find((e) => e.id.toString() === eventId.toString());

      if (!event) {
        throw new Error("Event not found");
      }

      setEvent(event);

      // Fetch sub-events
      const subEventsResponse = await fetch(
        `http://localhost:8080/sub-events/${eventId}`
      );
      if (!subEventsResponse.ok) {
        throw new Error(
          `Failed to fetch sub-events. Status: ${subEventsResponse.status}`
        );
      }

      const subEventsData = await subEventsResponse.json();
      console.log("Sub-events data:", subEventsData);

      // Process sub-events to ensure they have valid IDs
      const processedSubEvents = subEventsData.map((subEvent, index) => {
        // If the sub-event doesn't have an ID, use the index as a fallback
        if (subEvent.id === undefined || subEvent.id === null) {
          console.warn(
            `Sub-event at index ${index} has no ID, using index as fallback`
          );
          return { ...subEvent, id: index + 1 };
        }
        return subEvent;
      });

      setSubEvents(processedSubEvents);
    } catch (err) {
      console.error("Error fetching event details:", err);
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

  // Update the registerIndividual function to match the ParticipantDTO structure
  const registerIndividual = async (subEventId) => {
    try {
      setError("");
      setDebugInfo("");
      setRegistering(true);
      setRegisteringSubEventId(subEventId);

      console.log("Starting registration for sub-event ID:", subEventId);
      setDebugInfo(
        (prev) =>
          prev + `\nStarting registration for sub-event ID: ${subEventId}`
      );

      // Make sure userId is a number
      const userIdNum = Number(userId);
      const subEventIdNum = Number(subEventId);

      // Log the conversion to check for NaN
      console.log("Converting userId:", userId, "to number:", userIdNum);
      console.log(
        "Converting subEventId:",
        subEventId,
        "to number:",
        subEventIdNum
      );

      setDebugInfo(
        (prev) =>
          prev +
          `\nUserId: ${userId} (${typeof userId}) -> ${userIdNum} (${typeof userIdNum})`
      );
      setDebugInfo(
        (prev) =>
          prev +
          `\nSubEventId: ${subEventId} (${typeof subEventId}) -> ${subEventIdNum} (${typeof subEventIdNum})`
      );

      // Check for NaN
      if (isNaN(userIdNum)) {
        throw new Error("Invalid user ID");
      }

      if (isNaN(subEventIdNum)) {
        throw new Error("Invalid sub-event ID");
      }

      // Create participant data for individual registration
      // For individual participants, teamName and teamMembers should be null
      const participantData = {
        userId: userIdNum,
        subEventId: subEventIdNum,
        teamName: null,
        teamMembers: null,
      };

      console.log(
        "Sending individual registration data:",
        JSON.stringify(participantData, null, 2)
      );
      setDebugInfo(
        (prev) =>
          prev +
          `\nSending registration data: ${JSON.stringify(
            participantData,
            null,
            2
          )}`
      );

      const response = await fetch(
        "http://localhost:8080/participants/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(participantData),
        }
      );

      // Log the raw response for debugging
      const responseText = await response.text();
      console.log("Raw response:", responseText);
      setDebugInfo((prev) => prev + `\nRaw response: ${responseText}`);

      // Parse the response if it's valid JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse response as JSON:", e);
        setDebugInfo(
          (prev) => prev + `\nFailed to parse response as JSON: ${e.message}`
        );
        throw new Error(`Invalid response format: ${responseText}`);
      }

      console.log("Parsed registration response:", data);
      setDebugInfo(
        (prev) =>
          prev + `\nParsed registration response: ${JSON.stringify(data)}`
      );

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to register for the event");
      }

      alert("Successfully registered for the event!");
      router.push("/events/participate");
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || "An error occurred during registration");
      setDebugInfo((prev) => prev + `\nRegistration error: ${err.message}`);
    } finally {
      setRegistering(false);
      setRegisteringSubEventId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 antialiased bg-grid-blue/[0.02]">
      {/* Floating papers background */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <FloatingPaper count={6} />
      </div>

      <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <Button
          variant="ghost"
          className="mb-4 text-gray-600 hover:text-primary"
          onClick={() => router.push("/events/participate")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>

        {error && (
          <Alert
            variant="destructive"
            className="mb-6 bg-red-50 border-red-200 text-red-800"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Debug info section */}
        {debugInfo && (
          <div className="bg-gray-100 p-4 rounded-md mb-4 text-xs font-mono overflow-auto max-h-40">
            <p className="font-semibold mb-1">Debug Info:</p>
            <pre className="whitespace-pre-wrap">{debugInfo}</pre>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">Loading event details...</div>
        ) : (
          <>
            {event && (
              <Card className="bg-white shadow-md mb-8">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">
                    {event.name}
                  </CardTitle>
                  <CardDescription>{event.description}</CardDescription>
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
              </Card>
            )}

            <h2 className="text-2xl font-bold mb-4">Sub-Events</h2>

            {!subEvents || subEvents.length === 0 ? (
              <Card className="bg-white shadow-md">
                <CardContent className="flex flex-col items-center justify-center h-32">
                  <p className="text-gray-500">
                    No sub-events available for this event
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subEvents.map((subEvent, index) => (
                  <Card
                    key={`subevent-${subEvent.id || index}`}
                    className="bg-white shadow-md hover:shadow-lg transition-shadow"
                  >
                    <CardHeader>
                      <CardTitle>{subEvent.name}</CardTitle>
                      <div className="flex items-center mt-1">
                        <Badge
                          variant={subEvent.teamBased ? "secondary" : "outline"}
                        >
                          {subEvent.teamBased
                            ? "Team-based event"
                            : "Individual event"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center text-gray-600">
                        <Users className="h-4 w-4 mr-2 text-primary" />
                        <span>
                          Max Participants: {subEvent.maxParticipants}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 text-primary" />
                        <span>
                          Ground:{" "}
                          {subEvent.groundId
                            ? `Ground #${subEvent.groundId}`
                            : "No ground assigned"}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2 text-primary" />
                        <span>Start: {formatDateTime(subEvent.startTime)}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-2 text-primary" />
                        <span>End: {formatDateTime(subEvent.endTime)}</span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      {subEvent.teamBased ? (
                        <Button
                          className="w-full bg-primary hover:bg-blue-700 text-white"
                          onClick={() => {
                            console.log(
                              "Navigating to team registration with ID:",
                              subEvent.id
                            );
                            router.push(
                              `/events/register/${subEvent.id}?teamBased=true`
                            );
                          }}
                        >
                          <Users className="mr-2 h-4 w-4" />
                          Create Team
                        </Button>
                      ) : (
                        <Button
                          className="w-full bg-primary hover:bg-blue-700 text-white"
                          onClick={() => registerIndividual(subEvent.id)}
                          disabled={
                            registering && registeringSubEventId === subEvent.id
                          }
                        >
                          {registering &&
                          registeringSubEventId === subEvent.id ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Registering...
                            </>
                          ) : (
                            "Register"
                          )}
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
