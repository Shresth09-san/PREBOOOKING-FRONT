import { useState, useEffect } from "react";
import { CalendarClock, Clock, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Fetch bookings from your backend

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const { fetchBookings } = useAuth();

  useEffect(() => {
    const getBookings = async () => {
      setLoading(true);
      try {
        const data = await fetchBookings();
        setBookings(data);
      
        setError(null);
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
        setError("Failed to load your bookings. Please try again later.");
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    getBookings();
  }, [fetchBookings]);

  const filteredBookings = bookings.filter((booking) => {
    if (selectedFilter === "all") return true;
    return booking.status === selectedFilter;
  });

  const handleCancelBooking = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/api/bookings/cancel/${id}`);
  
      const updated = await fetchBookings();
      setBookings(updated);
  
      toast({
        title: "Booking canceled",
        description: "Your booking has been successfully canceled.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to cancel booking. Please try again.",
        variant: "destructive",
      });
    }
  
    setIsDeleteDialogOpen(false);
  };
  

  const handleDeleteBooking = async (id) => {
    try {
      // You might want to call your API to delete the booking from the backend
      // await axios.delete(`${API_BASE_URL}/api/bookings/${id}`);

      // For now, we'll just update the local state
      setBookings(bookings.filter((booking) => booking.id !== id));

      toast({
        title: "Booking deleted",
        description: "Your booking has been removed from your history.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete booking. Please try again.",
        variant: "destructive",
      });
    }

    setIsDeleteDialogOpen(false);
  };



  const getStatusBadge = (status, isBooked) => {
    if (status === "pending") {
      return (
        <div className="flex items-center space-x-2">
          <Badge className="bg-blue-500 hover:bg-blue-600">Pending</Badge>
          {isBooked && (
            <span className="text-sm text-green-600 font-medium">(Booked)</span>
          )}
        </div>
      );
    }

    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>
        );
      case "canceled":
        return <Badge className="bg-red-500 hover:bg-red-600">Canceled</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        <p>{error}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Your Bookings</h3>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            className={selectedFilter === "all" ? "bg-muted" : ""}
            onClick={() => setSelectedFilter("all")}
          >
            All
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={selectedFilter === "pending" ? "bg-muted" : ""}
            onClick={() => setSelectedFilter("pending")}
          >
            Pending
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={selectedFilter === "completed" ? "bg-muted" : ""}
            onClick={() => setSelectedFilter("completed")}
          >
            Completed
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={selectedFilter === "canceled" ? "bg-muted" : ""}
            onClick={() => setSelectedFilter("canceled")}
          >
            Canceled
          </Button>
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="mx-auto text-muted-foreground mb-2" size={32} />
          <p className="text-muted-foreground">No bookings found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-card rounded-lg border border-border p-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{booking.service}</h4>
                  <p className="text-sm text-muted-foreground">
                    Provider: {booking.providerDetails?.name || "N/A"}
                  </p>

                  <div className="flex items-center mt-2 text-sm text-muted-foreground">
                    <CalendarClock className="mr-1" size={14} />
                    <span>
                      {booking.date} at {booking.time}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {booking.address}
                  </p>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  {getStatusBadge(booking.status, booking.isBooked)}

                  {booking.status === "pending" && (
                    <div className="flex space-x-2 mt-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            Reschedule
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Reschedule Appointment</DialogTitle>
                            <DialogDescription>
                              This feature is coming soon. You'll be able to
                              select a new date and time.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => {}}>
                              Close
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Dialog
                        open={isDeleteDialogOpen && deleteId === booking.id}
                        onOpenChange={(open) => {
                          setIsDeleteDialogOpen(open);
                          if (!open) setDeleteId(null);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleCancelBooking(booking.id)}
                         
                          >
                            Cancel
                          </Button> 
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Cancel Booking</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to cancel this booking? This
                              action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setIsDeleteDialogOpen(false)}
                            >
                              No, Keep It
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => handleCancelBooking(booking.id)}
                            >
                              Yes, Cancel Booking
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}

                  {booking.status === "canceled" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => {
                        setDeleteId(booking.id);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 size={14} />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={
          isDeleteDialogOpen &&
          deleteId !== null &&
          bookings.find((b) => b.id === deleteId)?.status === "canceled"
        }
        onOpenChange={setIsDeleteDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this canceled booking from your
              history?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              No, Keep It
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && handleDeleteBooking(deleteId)}
            >
              Yes, Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingHistory;
