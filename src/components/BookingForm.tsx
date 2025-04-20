import { useState } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AVAILABLE_SERVICES = [
  'Plumbing Services', 'Electrical Services', 'Carpentry Services', 
  'Home Appliance Repair', 'Painting Services', 'Pest Control',
  'Gardening & Landscaping', 'Home Renovation', 'AC & HVAC Services',
  'Home Security', 'Laundry Services', 'Moving & Relocation',
  'Wellness & Lifestyle', 'Vehicle Services', 'Smart Home',
  'Event Support', 'Handyman Services', 'IT & Technical Support'
];

const TIME_SLOTS = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', 
  '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
];

const BookingForm = () => {
  const [selectedService, setSelectedService] = useState<string>('');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [timeSlot, setTimeSlot] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [details, setDetails] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const { user } = useAuth();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedService || !date || !timeSlot || !address) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    console.log(user)
    try {
      // Prepare booking data
      const bookingData = {
        userId: user?.userid,  
        useremail: user?.email,
        userMobile: user?.mobnumber,
        homeownername: user?.name,
        serviceType: selectedService,
        date: format(date, "yyyy-MM-dd"),
        time: timeSlot,
        serviceAddress: address,
        additionalDetails: details || "",
        status: "" // Assuming this will be managed later
      };
      

      // Send POST request to backend
      const response = await axios.post(`${API_BASE_URL}/api/bookings/createBooking`, bookingData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log(response);
      
      // Handle successful response
      toast({
        title: "Booking successful!",
        description: `Your ${selectedService} appointment has been scheduled for ${format(date, "PPP")} at ${timeSlot}.`,
      });

      // Reset form
      setSelectedService('');
      setDate(undefined);
      setTimeSlot('');
      setAddress('');
      setDetails('');
    } catch (error) {
      // Handle error
      console.error('Booking request failed:', error);
      
      toast({
        title: "Booking failed",
        description: "There was an error processing your booking. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="service">Service Type*</Label>
            <Select value={selectedService} onValueChange={setSelectedService}>
              <SelectTrigger id="service" className="w-full">
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_SERVICES.map(service => (
                  <SelectItem key={service} value={service}>
                    {service}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Date*</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="time">Time Slot*</Label>
              <Select value={timeSlot} onValueChange={setTimeSlot}>
                <SelectTrigger id="time" className="w-full">
                  <SelectValue placeholder="Select a time" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map(slot => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="address">Service Address*</Label>
            <Input
              id="address"
              placeholder="Enter your full address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="details">Additional Details</Label>
            <Textarea
              id="details"
              placeholder="Describe your service needs in detail"
              className="min-h-32"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </div>
        </div>

        <Button type="submit" className="w-full bg-doit-400 hover:bg-doit-500" disabled={loading}>
          {loading ? (
            <>
              <Clock className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Book Appointment'
          )}
        </Button>
      </form>
    </div>
  );
};

export default BookingForm;
