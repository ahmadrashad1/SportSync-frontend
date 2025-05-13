"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Plus, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Navbar from "@/components/navbar";
import { FloatingPaper } from "@/components/floating-paper";

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id;

  const [userId, setUserId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [grounds, setGrounds] = useState([]);
  const [eventData, setEventData] = useState({
    id: null,
    name: "",
    description: "",
    startTime: "",
    endTime: "",
    createdByUserId: null,
  });
  const [subEvents, setSubEvents] = useState([]);

  useEffect(() => {
    // Check if user is logged in
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
      setIsLoggedIn(true);
      fetchGrounds();
      fetchEventDetails(eventId, storedUserId);
    } else {
      router.push("/login");
    }
  }, [router, eventId]);

  const fetchGrounds = async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/api/grounds/available"
      );
      if (!response.ok) {
        throw new Error("Failed to fetch grounds");
      }
      const data = await response.json();
      setGrounds(data);
    } catch (err) {
      setError("Failed to load grounds: " + err.message);
    }
  };

  const fetchEventDetails = async (eventId, userId) => {
    try {
      // Fetch event details
      const eventResponse = await fetch(
        `http://localhost:8080/my-events/my/${userId}`
      );
      if (!eventResponse.ok) {
        throw new Error("Failed to fetch events");
      }

      const events = await eventResponse.json();
      const event = events.find((e) => e.id.toString() === eventId.toString());

      if (!event) {
        throw new Error("Event not found");
      }

      // Format dates for input fields
      const formattedEvent = {
        ...event,
        startTime: formatDateForInput(event.startTime),
        endTime: formatDateForInput(event.endTime),
      };

      setEventData(formattedEvent);

      // Fetch sub-events
      const subEventsResponse = await fetch(
        `http://localhost:8080/sub-events/${eventId}`
      );
      if (!subEventsResponse.ok) {
        throw new Error("Failed to fetch sub-events");
      }

      const subEventsData = await subEventsResponse.json();

      // Format dates for input fields
      const formattedSubEvents = subEventsData.map((subEvent) => ({
        ...subEvent,
        startTime: formatDateForInput(subEvent.startTime),
        endTime: formatDateForInput(subEvent.endTime),
      }));

      setSubEvents(formattedSubEvents);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Format date from backend ISO format to datetime-local input format
  const formatDateForInput = (dateTimeStr) => {
    if (!dateTimeStr) return "";
    const date = new Date(dateTimeStr);
    return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDThh:mm
  };

  // Format date to match the backend expected format: yyyy-MM-dd'T'HH:mm:ss
  const formatDateForBackend = (dateTimeString) => {
    if (!dateTimeString) return null;

    // Parse the input datetime-local value
    const date = new Date(dateTimeString);

    // Format to match the expected backend format
    return date.toISOString().slice(0, 19).replace("Z", "");
  };

  const handleEventChange = (e) => {
    const { name, value } = e.target;
    setEventData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubEventChange = (index, field, value) => {
    const updatedSubEvents = [...subEvents];
    updatedSubEvents[index][field] = value;
    setSubEvents(updatedSubEvents);
  };

  const addSubEvent = () => {
    setSubEvents([
      ...subEvents,
      {
        name: "",
        teamBased: false,
        maxParticipants: 1,
        groundId: "",
        startTime: "",
        endTime: "",
      },
    ]);
  };

  const removeSubEvent = (index) => {
    if (subEvents.length > 1) {
      const updatedSubEvents = [...subEvents];
      updatedSubEvents.splice(index, 1);
      setSubEvents(updatedSubEvents);
    }
  };

  const validateForm = () => {
    // Event validation
    if (
      !eventData.name ||
      !eventData.description ||
      !eventData.startTime ||
      !eventData.endTime
    ) {
      setError("All event fields are required");
      return false;
    }

    // Name validation
    const nameRegex = /^[A-Za-z0-9 ]+$/;
    if (!nameRegex.test(eventData.name)) {
      setError("Event name must contain only letters, numbers, and spaces");
      return false;
    }

    if (eventData.name.length < 3 || eventData.name.length > 100) {
      setError("Event name must be between 3 and 100 characters");
      return false;
    }

    // Description validation
    if (
      eventData.description.length < 10 ||
      eventData.description.length > 500
    ) {
      setError("Description must be between 10 and 500 characters");
      return false;
    }

    // Time validation
    const startTime = new Date(eventData.startTime);
    const endTime = new Date(eventData.endTime);
    if (startTime >= endTime) {
      setError("End time must be after start time");
      return false;
    }

    // Sub-events validation
    for (let i = 0; i < subEvents.length; i++) {
      const subEvent = subEvents[i];
      if (
        !subEvent.name ||
        !subEvent.groundId ||
        !subEvent.startTime ||
        !subEvent.endTime
      ) {
        setError(`All fields in sub-event ${i + 1} are required`);
        return false;
      }

      if (!nameRegex.test(subEvent.name)) {
        setError(
          `Sub-event ${
            i + 1
          } name must contain only letters, numbers, and spaces`
        );
        return false;
      }

      if (subEvent.name.length < 3 || subEvent.name.length > 100) {
        setError(
          `Sub-event ${i + 1} name must be between 3 and 100 characters`
        );
        return false;
      }

      if (subEvent.maxParticipants < 1 || subEvent.maxParticipants > 1000) {
        setError(
          `Sub-event ${i + 1} must have between 1 and 1000 participants`
        );
        return false;
      }

      const subEventStart = new Date(subEvent.startTime);
      const subEventEnd = new Date(subEvent.endTime);
      if (subEventStart >= subEventEnd) {
        setError(`Sub-event ${i + 1} end time must be after start time`);
        return false;
      }

      // Check if sub-event is within event time range
      if (subEventStart < startTime || subEventEnd > endTime) {
        setError(`Sub-event ${i + 1} must be within the main event time range`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!validateForm()) {
        setLoading(false);
        return;
      }

      // Ensure createdByUserId is set
      if (!eventData.createdByUserId && userId) {
        setEventData((prev) => ({
          ...prev,
          createdByUserId: Number.parseInt(userId),
        }));
      }

      // Prepare data with properly formatted dates
      const formattedEventData = {
        ...eventData,
        startTime: formatDateForBackend(eventData.startTime),
        endTime: formatDateForBackend(eventData.endTime),
      };

      // Format dates for sub-events
      const formattedSubEvents = subEvents.map((subEvent) => ({
        ...subEvent,
        startTime: formatDateForBackend(subEvent.startTime),
        endTime: formatDateForBackend(subEvent.endTime),
      }));

      // Update event
      const eventResponse = await fetch(
        `http://localhost:8080/my-events/update/${eventId}/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedEventData),
        }
      );

      if (!eventResponse.ok) {
        const eventError = await eventResponse.text();
        throw new Error(eventError || "Failed to update event");
      }

      // Update sub-events
      const subEventsResponse = await fetch(
        `http://localhost:8080/sub-events/update/${eventId}/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedSubEvents),
        }
      );

      if (!subEventsResponse.ok) {
        const subEventError = await subEventsResponse.text();
        throw new Error(subEventError || "Failed to update sub-events");
      }

      // Redirect to my events page
      router.push("/events/my-events");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 antialiased bg-grid-blue/[0.02] flex items-center justify-center">
        <div className="text-gray-700">Loading event details...</div>
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
        <Card className="w-full max-w-4xl mx-auto bg-white shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Edit Event</CardTitle>
            <CardDescription>
              Update your event details and sub-events
            </CardDescription>
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
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Event Details</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-700">
                      Event Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={eventData.name}
                      onChange={handleEventChange}
                      className="border-gray-300"
                      placeholder="Enter event name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-gray-700">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={eventData.description}
                      onChange={handleEventChange}
                      className="border-gray-300 min-h-[100px]"
                      placeholder="Describe your event"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startTime" className="text-gray-700">
                        Start Time
                      </Label>
                      <Input
                        id="startTime"
                        name="startTime"
                        type="datetime-local"
                        value={eventData.startTime}
                        onChange={handleEventChange}
                        className="border-gray-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endTime" className="text-gray-700">
                        End Time
                      </Label>
                      <Input
                        id="endTime"
                        name="endTime"
                        type="datetime-local"
                        value={eventData.endTime}
                        onChange={handleEventChange}
                        className="border-gray-300"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Sub-Events</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSubEvent}
                    className="text-primary border-primary hover:bg-primary/10"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Sub-Event
                  </Button>
                </div>

                {subEvents.map((subEvent, index) => (
                  <Card key={index} className="bg-gray-50 border-gray-200">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-md">
                          Sub-Event {index + 1}
                        </CardTitle>
                        {subEvents.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSubEvent(index)}
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
                          htmlFor={`subEvent-${index}-name`}
                          className="text-gray-700"
                        >
                          Name
                        </Label>
                        <Input
                          id={`subEvent-${index}-name`}
                          value={subEvent.name}
                          onChange={(e) =>
                            handleSubEventChange(index, "name", e.target.value)
                          }
                          className="border-gray-300"
                          placeholder="Sub-event name"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`subEvent-${index}-teamBased`}
                          checked={subEvent.teamBased}
                          onCheckedChange={(checked) =>
                            handleSubEventChange(index, "teamBased", checked)
                          }
                        />
                        <Label
                          htmlFor={`subEvent-${index}-teamBased`}
                          className="text-gray-700"
                        >
                          Team-based event
                        </Label>
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor={`subEvent-${index}-maxParticipants`}
                          className="text-gray-700"
                        >
                          Max Participants
                        </Label>
                        <Input
                          id={`subEvent-${index}-maxParticipants`}
                          type="number"
                          min="1"
                          max="1000"
                          value={subEvent.maxParticipants}
                          onChange={(e) =>
                            handleSubEventChange(
                              index,
                              "maxParticipants",
                              Number.parseInt(e.target.value)
                            )
                          }
                          className="border-gray-300"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor={`subEvent-${index}-ground`}
                          className="text-gray-700"
                        >
                          Ground
                        </Label>
                        <Select
                          value={
                            subEvent.groundId
                              ? subEvent.groundId.toString()
                              : ""
                          }
                          onValueChange={(value) =>
                            handleSubEventChange(
                              index,
                              "groundId",
                              Number.parseInt(value)
                            )
                          }
                        >
                          <SelectTrigger className="border-gray-300">
                            <SelectValue placeholder="Select a ground" />
                          </SelectTrigger>
                          <SelectContent>
                            {grounds.map((ground) => (
                              <SelectItem
                                key={ground.id}
                                value={ground.id.toString()}
                              >
                                {ground.name} - {ground.location}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor={`subEvent-${index}-startTime`}
                            className="text-gray-700"
                          >
                            Start Time
                          </Label>
                          <Input
                            id={`subEvent-${index}-startTime`}
                            type="datetime-local"
                            value={subEvent.startTime}
                            onChange={(e) =>
                              handleSubEventChange(
                                index,
                                "startTime",
                                e.target.value
                              )
                            }
                            className="border-gray-300"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor={`subEvent-${index}-endTime`}
                            className="text-gray-700"
                          >
                            End Time
                          </Label>
                          <Input
                            id={`subEvent-${index}-endTime`}
                            type="datetime-local"
                            value={subEvent.endTime}
                            onChange={(e) =>
                              handleSubEventChange(
                                index,
                                "endTime",
                                e.target.value
                              )
                            }
                            className="border-gray-300"
                          />
                        </div>
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
                {loading ? "Updating Event..." : "Update Event"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
