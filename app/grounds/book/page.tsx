"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { AlertCircle, Calendar, Clock, MapPin, Trash2 } from "lucide-react";
import { FloatingPaper } from "@/components/floating-paper";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Navbar from "@/components/navbar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function BookGroundPage() {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [grounds, setGrounds] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [deleteBookingId, setDeleteBookingId] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [bookingData, setBookingData] = useState({
    userId: null,
    groundId: "",
    startTime: "",
    endTime: "",
  });

  useEffect(() => {
    // Check if user is logged in
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
      setIsLoggedIn(true);
      setBookingData((prev) => ({
        ...prev,
        userId: Number.parseInt(storedUserId),
      }));
      fetchGrounds();
      fetchBookings(storedUserId);
    } else {
      router.push("/login");
    }
  }, [router]);

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
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async (userId) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/bookings/user/${userId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch bookings");
      }
      const data = await response.json();
      setBookings(data);
    } catch (err) {
      setError("Failed to load bookings: " + err.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGroundChange = (value) => {
    setBookingData((prev) => ({ ...prev, groundId: Number.parseInt(value) }));
  };

  // Format date to match the backend expected format: yyyy-MM-dd'T'HH:mm:ss
  const formatDateForBackend = (dateTimeString) => {
    if (!dateTimeString) return null;

    // Parse the input datetime-local value
    const date = new Date(dateTimeString);

    // Format to match the expected backend format
    return date.toISOString().slice(0, 19).replace("Z", "");
  };

  const validateForm = () => {
    if (
      !bookingData.groundId ||
      !bookingData.startTime ||
      !bookingData.endTime
    ) {
      setError("All fields are required");
      return false;
    }

    const startTime = new Date(bookingData.startTime);
    const endTime = new Date(bookingData.endTime);

    if (startTime >= endTime) {
      setError("End time must be after start time");
      return false;
    }

    // Check if booking is in the past
    const now = new Date();
    if (startTime < now) {
      setError("Cannot book a ground in the past");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setBookingLoading(true);

    try {
      if (!validateForm()) {
        setBookingLoading(false);
        return;
      }

      // Prepare data with properly formatted dates
      const formattedBookingData = {
        userId: bookingData.userId,
        groundId: bookingData.groundId,
        startTime: formatDateForBackend(bookingData.startTime),
        endTime: formatDateForBackend(bookingData.endTime),
      };

      const response = await fetch("http://localhost:8080/api/bookings/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedBookingData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Failed to book ground");
      }

      const data = await response.json();
      setSuccess("Ground booked successfully");

      // Reset form
      setBookingData({
        userId: Number.parseInt(userId),
        groundId: "",
        startTime: "",
        endTime: "",
      });

      // Refresh bookings
      fetchBookings(userId);
    } catch (err) {
      setError(err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleDeleteBooking = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/bookings/${deleteBookingId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to cancel booking");
      }

      // Refresh bookings list
      fetchBookings(userId);
      setIsDeleteDialogOpen(false);
      setSuccess("Booking cancelled successfully");
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDateTime = (dateTimeStr) => {
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Book Ground Form */}
          <Card className="bg-white shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">
                Book a Ground
              </CardTitle>
              <CardDescription>
                Reserve a sports ground for your activities
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

              {success && (
                <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ground" className="text-gray-700">
                    Select Ground
                  </Label>
                  <Select
                    value={bookingData.groundId.toString()}
                    onValueChange={handleGroundChange}
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
                    <Label htmlFor="startTime" className="text-gray-700">
                      Start Time
                    </Label>
                    <Input
                      id="startTime"
                      name="startTime"
                      type="datetime-local"
                      value={bookingData.startTime}
                      onChange={handleInputChange}
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
                      value={bookingData.endTime}
                      onChange={handleInputChange}
                      className="border-gray-300"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-blue-700 text-white"
                  disabled={bookingLoading}
                >
                  {bookingLoading ? "Booking..." : "Book Ground"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* My Bookings */}
          <Card className="bg-white shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">My Bookings</CardTitle>
              <CardDescription>
                View and manage your ground bookings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="text-gray-700">Loading bookings...</div>
                </div>
              ) : bookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32">
                  <Calendar className="h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-gray-500">
                    You don&apos;t have any bookings yet
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <Card
                      key={booking.id}
                      className="bg-gray-50 border-gray-200"
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <h3 className="font-medium">
                              {booking.ground.name}
                            </h3>
                            <div className="flex items-center text-gray-600 text-sm">
                              <MapPin className="h-3 w-3 mr-1 text-primary" />
                              <span>{booking.ground.location}</span>
                            </div>
                            <div className="flex items-center text-gray-600 text-sm">
                              <Calendar className="h-3 w-3 mr-1 text-primary" />
                              <span>
                                Start: {formatDateTime(booking.startTime)}
                              </span>
                            </div>
                            <div className="flex items-center text-gray-600 text-sm">
                              <Clock className="h-3 w-3 mr-1 text-primary" />
                              <span>
                                End: {formatDateTime(booking.endTime)}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setDeleteBookingId(booking.id);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription className="text-gray-500">
              Are you sure you want to cancel this booking? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteBooking}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
