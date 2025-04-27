import { useState, useEffect } from "react";
import { CalendarIcon, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const AVAILABLE_SERVICES = [
  "Plumbing Service",
  "Electrical Service",
  "Carpentry Service",
  "Home Appliance Repair",
  "Painting Services",
  "Pest Control Services",
  "Gardening & Landscaping",
  "Home Renovation",
  "AC & HVAC Services",
  "Home Security",
  "Laundry Services",
  "Moving & Relocation",
  "Wellness & Lifestyle",
  "Vehicle Services",
  "Smart Home",
  "Event Support",
  "Handyman Services",
  "IT & Technical Support",
];

const TIME_SLOTS = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
];

const BookingForm = () => {
  // const [selectedService, setSelectedService] = useState<string>('');
  // const [price, setPrice] = useState<string>('');
  // const [date, setDate] = useState<Date | undefined>(undefined);
  // const [timeSlot, setTimeSlot] = useState<string>('');
  // const [address, setAddress] = useState<string>('');
  // const [details, setDetails] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const Navigate = useNavigate();

  const {
    user,
    servicesList,
    getServicePrice,
    selectedService,
    setSelectedService,
    price,
    setPrice,
    date,
    setDate,
    timeSlot,
    setTimeSlot,
    address,
    setAddress,
    details,
    setDetails,
  } = useAuth();

  useEffect(() => {
    if (servicesList.length === 0) {
      getServicePrice();
    }
  }, []);

  useEffect(() => {
    if (selectedService && servicesList.length > 0) {
      const match = servicesList.find(
        (item) => item.name.toLowerCase() === selectedService.toLowerCase()
      );
      if (match) {
        setPrice(match.price);
      } else {
        setPrice("");
      }
    }
  }, [selectedService, servicesList]);

  function handleBookAppointment() {
    const bookingDataToStore = {
      selectedService,
      price,
      date: date ? date.toISOString() : null, // Convert Date to string
      timeSlot,
      address,
      details,
    };

    localStorage.setItem("pending-booking", JSON.stringify(bookingDataToStore));
    Navigate("/Payment");
  }

 


  return (
    <div>
      <form className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="service">Service Type*</Label>
            <Select value={selectedService} onValueChange={setSelectedService}>
              <SelectTrigger id="service" className="w-full">
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_SERVICES.map((service) => (
                  <SelectItem key={service} value={service}>
                    {service}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {price && (
              <p className="mt-2 text-green-600 font-medium">
                Price of a particular Service is: {price}
              </p>
            )}
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
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
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
                  {TIME_SLOTS.map((slot) => (
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

        <Button
          type="submit"
          className="w-full bg-doit-400 hover:bg-doit-500"
          disabled={loading}
          onClick={handleBookAppointment}
        >
          {loading ? (
            <>
              <Clock className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Book Appointment"
          )}
        </Button>
      </form>
    </div>
  );
};

export default BookingForm;
