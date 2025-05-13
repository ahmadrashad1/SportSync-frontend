"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Plus, Trash2, Loader2, ArrowLeft } from "lucide-react";
import { FloatingPaper } from "@/components/floating-paper";
import Navbar from "@/components/navbar";
import { Badge } from "@/components/ui/badge";

export default function RegisterForEventPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const subEventId = params.id;
  const isTeamBased = searchParams.get("teamBased") === "true";

  const [userId, setUserId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [subEventDetails, setSubEventDetails] = useState(null);
  const [debugInfo, setDebugInfo] = useState("");

  const [teamName, setTeamName] = useState("");
  const [teamMembers, setTeamMembers] = useState([{ name: "", email: "" }]);
  const [validationErrors, setValidationErrors] = useState({
    teamName: "",
    teamMembers: [{ name: "", email: "" }],
  });

  useEffect(() => {
    console.log(
      "Register page loaded with subEventId:",
      subEventId,
      "isTeamBased:",
      isTeamBased
    );

    // Check if user is logged in
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
      setIsLoggedIn(true);

      // Only fetch sub-event details if we have a valid ID
      if (subEventId && subEventId !== "undefined") {
        fetchSubEventDetails(subEventId, storedUserId);
      } else {
        setError("Invalid event. Please try again.");
        setInitialLoading(false);
      }
    } else {
      router.push("/login");
    }
  }, [router, subEventId, isTeamBased]);

  const fetchSubEventDetails = async (id, userId) => {
    try {
      console.log("Validating sub-event ID:", id);
      setDebugInfo((prev) => prev + `\nValidating sub-event ID: ${id}`);

      // Find which event this sub-event belongs to
      const eventsResponse = await fetch(
        `http://localhost:8080/api/events/allexceptmine/${userId}`
      );
      if (!eventsResponse.ok) {
        throw new Error("Failed to fetch events");
      }

      const events = await eventsResponse.json();
      console.log("Fetched events:", events);
      setDebugInfo((prev) => prev + `\nFetched ${events.length} events`);

      let foundSubEvent = null;

      // For each event, check its sub-events
      for (const event of events) {
        console.log(`Checking sub-events for event ${event.id}`);
        setDebugInfo(
          (prev) => prev + `\nChecking sub-events for event ${event.id}`
        );

        const subEventsResponse = await fetch(
          `http://localhost:8080/sub-events/${event.id}`
        );

        if (subEventsResponse.ok) {
          const subEvents = await subEventsResponse.json();
          console.log(`Sub-events for event ${event.id}:`, subEvents);
          setDebugInfo(
            (prev) =>
              prev +
              `\nFound ${subEvents.length} sub-events for event ${event.id}`
          );

          const subEvent = subEvents.find(
            (se) => se.id && se.id.toString() === id.toString()
          );

          if (subEvent) {
            console.log("Found matching sub-event:", subEvent);
            setDebugInfo(
              (prev) =>
                prev + `\nFound matching sub-event: ${JSON.stringify(subEvent)}`
            );
            foundSubEvent = subEvent;
            setSubEventDetails(subEvent);
            break;
          }
        }
      }

      if (!foundSubEvent) {
        setError("Invalid sub-event. Please try again.");
        setDebugInfo((prev) => prev + `\nError: Sub-event not found`);
      } else if (isTeamBased && !foundSubEvent.teamBased) {
        setError("This is not a team-based event. Please try again.");
        setDebugInfo((prev) => prev + `\nError: Not a team-based event`);
      } else if (!isTeamBased && foundSubEvent.teamBased) {
        setError("This is a team-based event. Please try again.");
        setDebugInfo(
          (prev) =>
            prev +
            `\nError: Is a team-based event but trying to register as individual`
        );
      }
    } catch (err) {
      console.error("Error validating sub-event:", err);
      setError("Failed to validate sub-event: " + err.message);
      setDebugInfo(
        (prev) => prev + `\nError validating sub-event: ${err.message}`
      );
    } finally {
      setInitialLoading(false);
    }
  };

  const handleTeamMemberChange = (index, field, value) => {
    const updatedMembers = [...teamMembers];
    updatedMembers[index][field] = value;
    setTeamMembers(updatedMembers);

    // Clear validation error when user types
    const updatedErrors = { ...validationErrors };
    if (updatedErrors.teamMembers[index]) {
      updatedErrors.teamMembers[index][field] = "";
      setValidationErrors(updatedErrors);
    }
  };

  const addTeamMember = () => {
    if (teamMembers.length < 15) {
      setTeamMembers([...teamMembers, { name: "", email: "" }]);
      // Add empty validation slot
      const updatedErrors = { ...validationErrors };
      updatedErrors.teamMembers.push({ name: "", email: "" });
      setValidationErrors(updatedErrors);
    } else {
      setError("Maximum 15 team members allowed");
    }
  };

  const removeTeamMember = (index) => {
    if (teamMembers.length > 1) {
      const updatedMembers = [...teamMembers];
      updatedMembers.splice(index, 1);
      setTeamMembers(updatedMembers);

      // Remove validation slot
      const updatedErrors = { ...validationErrors };
      updatedErrors.teamMembers.splice(index, 1);
      setValidationErrors(updatedErrors);
    }
  };

  const validateForm = () => {
    let isValid = true;
    const errors = {
      teamName: "",
      teamMembers: Array(teamMembers.length)
        .fill(null)
        .map(() => ({ name: "", email: "" })),
    };

    // Check if subEventId is valid
    if (!subEventId || subEventId === "undefined") {
      setError("Invalid event. Please try again.");
      return false;
    }

    // Team name validation for team-based events
    if (isTeamBased) {
      if (!teamName) {
        errors.teamName = "Team name is required";
        isValid = false;
      } else {
        const nameRegex = /^[A-Za-z0-9 ]+$/;
        if (!nameRegex.test(teamName)) {
          errors.teamName =
            "Team name must contain only letters, numbers, and spaces";
          isValid = false;
        } else if (teamName.length < 3 || teamName.length > 100) {
          errors.teamName = "Team name must be between 3 and 100 characters";
          isValid = false;
        }
      }
    }

    // For team-based events, validate all team members
    // For individual events, we don't need to validate as we won't send team members
    if (isTeamBased) {
      for (let i = 0; i < teamMembers.length; i++) {
        const member = teamMembers[i];

        if (!member.name) {
          errors.teamMembers[i].name = "Team member name is required";
          isValid = false;
        } else {
          const nameRegex = /^[A-Za-z0-9 ]+$/;
          if (!nameRegex.test(member.name)) {
            errors.teamMembers[i].name =
              "Name must contain only letters, numbers, and spaces";
            isValid = false;
          } else if (member.name.length < 2 || member.name.length > 100) {
            errors.teamMembers[i].name =
              "Name must be between 2 and 100 characters";
            isValid = false;
          }
        }

        if (!member.email) {
          errors.teamMembers[i].email = "Email is required";
          isValid = false;
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(member.email)) {
            errors.teamMembers[i].email = "Invalid email format";
            isValid = false;
          }
        }
      }
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setDebugInfo("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
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

      // Prepare the participant data according to the ParticipantDTO structure
      const participantData = {
        userId: userIdNum,
        subEventId: subEventIdNum,
      };

      // Only include teamName and teamMembers for team-based events
      if (isTeamBased) {
        participantData.teamName = teamName;
        participantData.teamMembers = teamMembers;
      } else {
        // For individual events, teamName and teamMembers should be null
        participantData.teamName = null;
        participantData.teamMembers = null;
      }

      console.log(
        "Sending registration data:",
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

      // Ensure we're using the correct URL
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

      setSuccess(data.message || "Successfully registered for the event");

      // Redirect after a short delay
      setTimeout(() => {
        router.push("/events/participate");
      }, 2000);
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || "An error occurred during registration");
      setDebugInfo((prev) => prev + `\nRegistration error: ${err.message}`);
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
            <p>Loading event details...</p>
          </div>
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
          onClick={() => router.push("/events/participate")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>

        <Card className="w-full max-w-2xl mx-auto bg-white shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">
                  Register for {isTeamBased ? "Team Event" : "Individual Event"}
                </CardTitle>
                <CardDescription>
                  {isTeamBased
                    ? "Create your team and add team members"
                    : "Register as an individual participant"}
                </CardDescription>
                {subEventDetails && (
                  <p className="text-sm text-gray-500 mt-2">
                    Sub-event: {subEventDetails.name}
                  </p>
                )}
              </div>
              <Badge variant={isTeamBased ? "secondary" : "outline"}>
                {isTeamBased ? "Team-based" : "Individual"}
              </Badge>
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

            {success && (
              <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Debug info section */}
              {debugInfo && (
                <div className="bg-gray-100 p-4 rounded-md mb-4 text-xs font-mono overflow-auto max-h-40">
                  <p className="font-semibold mb-1">Debug Info:</p>
                  <pre className="whitespace-pre-wrap">{debugInfo}</pre>
                </div>
              )}

              {/* Only show team name field for team-based events */}
              {isTeamBased && (
                <div className="space-y-2">
                  <Label htmlFor="teamName" className="text-gray-700">
                    Team Name
                  </Label>
                  <Input
                    id="teamName"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className={`border-gray-300 ${
                      validationErrors.teamName ? "border-red-500" : ""
                    }`}
                    placeholder="Enter your team name"
                  />
                  {validationErrors.teamName && (
                    <p className="text-sm text-red-500 mt-1">
                      {validationErrors.teamName}
                    </p>
                  )}
                </div>
              )}

              {/* Only show team members section for team-based events */}
              {isTeamBased && (
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
                            {index === 0
                              ? "Team Captain"
                              : `Member ${index + 1}`}
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
                            className={`border-gray-300 ${
                              validationErrors.teamMembers[index]?.name
                                ? "border-red-500"
                                : ""
                            }`}
                            placeholder="Enter name"
                          />
                          {validationErrors.teamMembers[index]?.name && (
                            <p className="text-sm text-red-500 mt-1">
                              {validationErrors.teamMembers[index].name}
                            </p>
                          )}
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
                            className={`border-gray-300 ${
                              validationErrors.teamMembers[index]?.email
                                ? "border-red-500"
                                : ""
                            }`}
                            placeholder="Enter email"
                          />
                          {validationErrors.teamMembers[index]?.email && (
                            <p className="text-sm text-red-500 mt-1">
                              {validationErrors.teamMembers[index].email}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* For individual events, show a simple message */}
              {!isTeamBased && (
                <div className="bg-blue-50 p-4 rounded-md text-blue-800 mb-4">
                  <p>
                    You are registering as an individual participant for this
                    event.
                  </p>
                  <p className="text-sm mt-2">
                    Click the Register button below to confirm your
                    participation.
                  </p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-blue-700 text-white"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  "Register"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
