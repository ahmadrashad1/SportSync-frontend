"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  Plus,
  Trash2,
  Users,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { FloatingPaper } from "@/components/floating-paper";
import Navbar from "@/components/navbar";
import { Badge } from "@/components/ui/badge";

export default function TeamRegistrationPage() {
  const router = useRouter();
  const params = useParams();
  const subEventId = params.id;

  const [userId, setUserId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [subEventDetails, setSubEventDetails] = useState(null);

  const [teamName, setTeamName] = useState("");
  const [teamMembers, setTeamMembers] = useState([{ name: "", email: "" }]);

  useEffect(() => {
    console.log("Team registration page loaded with subEventId:", subEventId);

    // Check if user is logged in
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
      setIsLoggedIn(true);

      // Validate subEventId
      if (!subEventId || subEventId === "undefined") {
        setError("Invalid sub-event ID. Please go back and try again.");
        setInitialLoading(false);
        return;
      }

      // Fetch sub-event details to confirm it exists and is team-based
      fetchSubEventDetails(subEventId, storedUserId);
    } else {
      router.push("/login");
    }
  }, [router, subEventId]);

  const fetchSubEventDetails = async (id, userId) => {
    try {
      console.log("Fetching sub-event details for ID:", id);

      // Find which event this sub-event belongs to
      const eventsResponse = await fetch(
        `http://localhost:8080/api/events/allexceptmine/${userId}`
      );
      if (!eventsResponse.ok) {
        throw new Error("Failed to fetch events");
      }

      const events = await eventsResponse.json();
      console.log("Fetched events:", events);

      // For each event, check its sub-events
      for (const event of events) {
        console.log(`Checking sub-events for event ${event.id}`);
        const subEventsResponse = await fetch(
          `http://localhost:8080/sub-events/${event.id}`
        );

        if (subEventsResponse.ok) {
          const subEvents = await subEventsResponse.json();
          console.log(`Sub-events for event ${event.id}:`, subEvents);

          const subEvent = subEvents.find(
            (se) => se.id && se.id.toString() === id.toString()
          );

          if (subEvent) {
            console.log("Found matching sub-event:", subEvent);
            setSubEventDetails(subEvent);

            // Verify this is a team-based event
            if (!subEvent.teamBased) {
              setError(
                "This is not a team-based event. Please go back and try again."
              );
            }

            setInitialLoading(false);
            return;
          }
        } else {
          console.log(`Failed to fetch sub-events for event ${event.id}`);
        }
      }

      // If we get here, the sub-event wasn't found
      console.log("Sub-event not found in any event");
      setError("Sub-event not found. Please go back and try again.");
    } catch (err) {
      console.error("Error fetching sub-event details:", err);
      setError("Failed to load sub-event details: " + err.message);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleTeamMemberChange = (index, field, value) => {
    const updatedMembers = [...teamMembers];
    updatedMembers[index][field] = value;
    setTeamMembers(updatedMembers);
  };

  const addTeamMember = () => {
    if (teamMembers.length < 15) {
      setTeamMembers([...teamMembers, { name: "", email: "" }]);
    } else {
      setError("Maximum 15 team members allowed");
    }
  };

  const removeTeamMember = (index) => {
    if (teamMembers.length > 1) {
      const updatedMembers = [...teamMembers];
      updatedMembers.splice(index, 1);
      setTeamMembers(updatedMembers);
    }
  };

  const validateForm = () => {
    // Basic validation
    if (!teamName.trim()) {
      setError("Team name is required");
      return false;
    }

    // Validate team name format
    const nameRegex = /^[A-Za-z0-9 ]+$/;
    if (!nameRegex.test(teamName)) {
      setError("Team name must contain only letters, numbers, and spaces");
      return false;
    }

    if (teamName.length < 3 || teamName.length > 100) {
      setError("Team name must be between 3 and 100 characters");
      return false;
    }

    // Validate team members
    for (const member of teamMembers) {
      if (!member.name.trim()) {
        setError("All team member names are required");
        return false;
      }

      if (!nameRegex.test(member.name)) {
        setError("Member names must contain only letters, numbers, and spaces");
        return false;
      }

      if (member.name.length < 2 || member.name.length > 100) {
        setError("Member names must be between 2 and 100 characters");
        return false;
      }

      if (!member.email.trim()) {
        setError("All team member emails are required");
        return false;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(member.email)) {
        setError("Please enter valid email addresses for all team members");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Prepare the participant data according to the ParticipantDTO structure
      const participantData = {
        userId: Number(userId),
        subEventId: Number(subEventId),
        teamName: teamName,
        teamMembers: teamMembers,
      };

      console.log(
        "Sending team registration data:",
        JSON.stringify(participantData, null, 2)
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

      // Parse the response if it's valid JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse response as JSON:", e);
        throw new Error(`Invalid response format: ${responseText}`);
      }

      console.log("Parsed registration response:", data);

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to register team for the event"
        );
      }

      alert("Team successfully registered for the event!");
      router.push("/events/participate");
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || "An error occurred during team registration");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 antialiased bg-grid-blue/[0.02]">
        <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
        <div className="container mx-auto px-4 py-8 relative z-10 flex justify-center items-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p>Loading sub-event details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (
    error &&
    (error.includes("Invalid sub-event ID") ||
      error.includes("Sub-event not found") ||
      error.includes("not a team-based event"))
  ) {
    return (
      <div className="min-h-screen bg-gray-50 antialiased bg-grid-blue/[0.02]">
        <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
        <div className="container mx-auto px-4 py-8 relative z-10">
          <Alert
            variant="destructive"
            className="mb-6 bg-red-50 border-red-200 text-red-800"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button
            variant="outline"
            onClick={() => router.push("/events/participate")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
        </div>
      </div>
    );
  }

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
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>

        <Card className="w-full max-w-2xl mx-auto bg-white shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">
                  Create Team
                </CardTitle>
                <CardDescription>
                  Form your team and register for this event
                </CardDescription>
                {subEventDetails && (
                  <p className="text-sm text-gray-500 mt-2">
                    Sub-event: {subEventDetails.name}
                  </p>
                )}
              </div>
              <Badge variant="secondary">Team-based event</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert
                variant="destructive"
                className="mb-6 bg-red-50 border-red-200 text-red-800"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="teamName" className="text-gray-700">
                  Team Name
                </Label>
                <Input
                  id="teamName"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="border-gray-300"
                  placeholder="Enter your team name"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Team Members</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addTeamMember}
                    className="text-primary border-primary hover:bg-primary/10"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Member
                  </Button>
                </div>

                {teamMembers.map((member, index) => (
                  <Card key={index} className="bg-gray-50 border-gray-200">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-md">
                          {index === 0 ? "Team Captain" : `Member ${index + 1}`}
                        </CardTitle>
                        {teamMembers.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTeamMember(index)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-0">
                      <div className="space-y-2">
                        <Label
                          htmlFor={`member-${index}-name`}
                          className="text-gray-700"
                        >
                          Name
                        </Label>
                        <Input
                          id={`member-${index}-name`}
                          value={member.name}
                          onChange={(e) =>
                            handleTeamMemberChange(
                              index,
                              "name",
                              e.target.value
                            )
                          }
                          className="border-gray-300"
                          placeholder="Enter name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor={`member-${index}-email`}
                          className="text-gray-700"
                        >
                          Email
                        </Label>
                        <Input
                          id={`member-${index}-email`}
                          type="email"
                          value={member.email}
                          onChange={(e) =>
                            handleTeamMemberChange(
                              index,
                              "email",
                              e.target.value
                            )
                          }
                          className="border-gray-300"
                          placeholder="Enter email"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-blue-700 text-white"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering Team...
                  </>
                ) : (
                  <>
                    <Users className="mr-2 h-4 w-4" />
                    Register Team
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="bg-gray-50 border-t border-gray-100 text-sm text-gray-500 px-6 py-4">
            <p>
              By registering, you confirm that all team members are eligible to
              participate in this event and agree to the event rules.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
