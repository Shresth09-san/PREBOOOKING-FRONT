

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, Calendar, MapPin, User, CheckCircle, XCircle, ClipboardList } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';

// Updated interface to remove 'booked' flag
interface Booking {
  id: string;
  homeownername: string;
  userId: string;
  service: string;
  date: string;
  time: string;
  address: string;
  status: 'pending' | 'completed' | 'declined';
  providerDetails?: {
    id: string;
    name: string;
    // Add other provider details as needed
  };
  additionalDetails?: string;
  createdAt?: {
    _seconds: number;
    _nanoseconds: number;
  };
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const BookingRequests = () => {
  const {fetchProviderBookings, user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'completed' | 'declined'>('all');

  // Fetch bookings when component mounts
  useEffect(() => {
    const getBookings = async () => {
      setLoading(true);
      try {
        const data = await fetchProviderBookings();
        console.log("Provider bookings:", data);
        setBookings(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
        setError("Failed to load booking requests. Please try again later.");
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    getBookings();
  }, [fetchProviderBookings]);

  const filteredBookings = bookings.filter(booking => {
    if (activeFilter === 'all') return true;
    return booking.status === activeFilter;
  });

  const updateBookingInBackend = async (id: string, updateData: any) => {
    try {
      // Using axios to send booking data to backend
      const response = await axios.put(`${API_BASE_URL}/api/bookings/${id}`, updateData);
      console.log('Booking updated successfully:', response.data);
      return true;
    } catch (error) {
      console.error('Error updating booking:', error);
      
      // Handle axios specific error information
      let errorMessage = "Failed to update booking status. Please try again.";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || errorMessage;
      }
      
      toast({
        title: "Update failed",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    }
  };

  const handleAcceptBooking = async (id: string) => {
    // Get the current booking
    const bookingToAccept = bookings.find(booking => booking.id === id);
    if (!bookingToAccept) return;
    
    // Get provider details from the auth context
    const providerDetails = {
      id: user?.userid || 'unknown',
      name: user?.name || 'Unknown Provider',
      // Add additional provider details as needed
    };
    
    // Create update data - assign provider details while keeping status as pending
    const updateData = {
      ...bookingToAccept,
      providerDetails: providerDetails,
      status:'pending'
    };
    
    // Send to backend
    const success = await updateBookingInBackend(id, updateData);
    
    if (success) {
      // Update local state to reflect changes
      setBookings(bookings.map(booking => 
        booking.id === id ? { ...booking, providerDetails } : booking
      ));
      
      toast({
        title: "Booking accepted",
        description: "You have successfully accepted this request.",
      });
      
      setIsDialogOpen(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: Booking['status']) => {
    // Get the current booking
    const currentBooking = bookings.find(booking => booking.id === id);
    if (!currentBooking) return;
  
    // Create update data with booking details
    const updateData = {
      ...currentBooking,
      status: newStatus,
    };
  
    // Special case: when declining, clear provider details
    if (newStatus === 'declined' || newStatus === 'canceled') {
      updateData.providerDetails = null;
    }
  
    const success = await updateBookingInBackend(id, updateData);
  
    if (success) {
      setBookings(bookings.map(booking => 
        booking.id === id ? { ...booking, ...updateData } : booking
      ));
  
      const statusMap = {
        'pending': 'updated',
        'declined': 'declined',
        'completed': 'marked as completed',
        'canceled': 'canceled',  // Add 'cancelled' status here
      };
  
      toast({
        title: "Status updated",
        description: `Booking has been ${statusMap[newStatus]}.`,
      });
  
      setIsDialogOpen(false);
    }
  };
  

  const getStatusBadge = (booking: Booking) => {
    if (booking.status === 'completed') {
      return <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>;
    } else if (booking.status === 'declined') {
      return <Badge className="bg-red-500 hover:bg-red-600">Declined</Badge>;
    } 
    else if(booking.status === 'canceled'){
      return <Badge className="bg-red-800 hover:bg-red-600">Canceled By Homeowners</Badge>;
    }
    else {
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading booking requests...</p>
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
      <Tabs defaultValue={activeFilter} value={activeFilter} onValueChange={(value) => setActiveFilter(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="declined">Declined</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="mt-6">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardList className="mx-auto text-muted-foreground mb-2" size={32} />
            <p className="text-muted-foreground">No bookings found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div 
                key={booking.id} 
                className="bg-card rounded-lg border border-border p-4 hover:border-doit-400/50 transition-colors cursor-pointer"
                onClick={() => {
                  setSelectedBooking(booking);
                  setIsDialogOpen(true);
                }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <h4 className="font-medium">{booking.service}</h4>
                      <div className="ml-3">{getStatusBadge(booking)}</div>
                    </div>
                    
                    <div className="flex flex-col space-y-1 mt-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <User size={14} className="mr-2" />
                        {booking.homeownername}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar size={14} className="mr-2" />
                        {booking.date} at {booking.time}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin size={14} className="mr-2" />
                        {booking.address}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    {booking.status === 'pending' && !booking.providerDetails && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="bg-green-500 text-white hover:bg-green-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAcceptBooking(booking.id);
                          }}
                        >
                          <CheckCircle size={14} className="mr-1" />
                          Accept
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="bg-red-500 text-white hover:bg-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusUpdate(booking.id, 'declined');
                          }}
                        >
                          <XCircle size={14} className="mr-1" />
                          Decline
                        </Button>
                      </>
                    )}
                    
                    {booking.status === 'pending' && booking.providerDetails && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="bg-green-500 text-white hover:bg-green-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusUpdate(booking.id, 'completed');
                        }}
                      >
                        <CheckCircle size={14} className="mr-1" />
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {selectedBooking && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Booking Details</DialogTitle>
              <DialogDescription>
                Complete information about this booking
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">{selectedBooking.service}</h3>
                <div>{getStatusBadge(selectedBooking)}</div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start">
                  <User className="mt-1 mr-3 text-doit-400" size={16} />
                  <div>
                    <p className="font-medium">Customer</p>
                    <p className="text-sm">{selectedBooking.homeownername}</p>
                    <p className="text-sm text-muted-foreground">User ID: {selectedBooking.userId}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Calendar className="mt-1 mr-3 text-doit-400" size={16} />
                  <div>
                    <p className="font-medium">Appointment</p>
                    <p className="text-sm">{selectedBooking.date}</p>
                    <p className="text-sm text-muted-foreground">{selectedBooking.time}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MapPin className="mt-1 mr-3 text-doit-400" size={16} />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-sm">{selectedBooking.address}</p>
                  </div>
                </div>
                
                {selectedBooking.additionalDetails && (
                  <div className="flex items-start">
                    <ClipboardList className="mt-1 mr-3 text-doit-400" size={16} />
                    <div>
                      <p className="font-medium">Additional Details</p>
                      <p className="text-sm">{selectedBooking.additionalDetails}</p>
                    </div>
                  </div>
                )}
                
                {selectedBooking.providerDetails && (
                  <div className="flex items-start">
                    <User className="mt-1 mr-3 text-doit-400" size={16} />
                    <div>
                      <p className="font-medium">Provider</p>
                      <p className="text-sm">{selectedBooking.providerDetails.name}</p>
                      <p className="text-sm text-muted-foreground">Provider ID: {selectedBooking.providerDetails.id}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter className="flex-col sm:flex-row gap-2">
              {selectedBooking.status === 'pending' && !selectedBooking.providerDetails && (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => handleStatusUpdate(selectedBooking.id, 'declined')}
                    className="sm:w-full"
                  >
                    Decline
                  </Button>
                  <Button 
                    onClick={() => handleAcceptBooking(selectedBooking.id)}
                    className="bg-doit-400 hover:bg-doit-500 sm:w-full"
                  >
                    Accept
                  </Button>
                </>
              )}
              
              {selectedBooking.status === 'pending' && selectedBooking.providerDetails && (
                <Button 
                  onClick={() => handleStatusUpdate(selectedBooking.id, 'completed')}
                  className="bg-green-500 hover:bg-green-600 w-full"
                >
                  Mark as Completed
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default BookingRequests;