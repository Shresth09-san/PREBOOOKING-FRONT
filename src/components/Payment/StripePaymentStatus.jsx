import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { format } from "date-fns";

const StripePaymentStatus = () => {
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status");
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const handlePaymentStatus = async () => {
     
      // Get booking data from localStorage
      let bookingData;
      try {
        const storedData = localStorage.getItem("pending-booking");
        if (!storedData) {
          throw new Error("No booking data found in storage");
        }

        bookingData = JSON.parse(storedData);
       

        // Convert ISO date string back to Date object if needed
        if (bookingData.date) {
          bookingData.date = new Date(bookingData.date);
        }
      } catch (error) {
        console.error("Error retrieving booking data:", error);
        toast({
          title: "Booking Information Missing",
          description:
            "We couldn't retrieve your booking details. Please return to the booking form and try again.",
          variant: "destructive",
        });
        setIsProcessing(false);
        setTimeout(() => navigate("/booking"), 3000);
        return;
      }

      if (status === "success") {
        try {
          // Check if user data is available
          if (!user || !user.userid) {
            throw new Error("User session expired or not found");
          }

          // Check if essential booking data is available
          if (
            !bookingData.selectedService ||
            !bookingData.date ||
            !bookingData.timeSlot ||
            !bookingData.address
          ) {
            throw new Error("Some booking details are missing");
          }

          const formattedDate =
            bookingData.date instanceof Date
              ? format(bookingData.date, "yyyy-MM-dd")
              : null;

          if (!formattedDate) {
            throw new Error("Invalid appointment date");
          }

          // Construct booking data to match expected backend structure
          const backendBookingData = {
            userId: user?.userid,
            useremail: user?.email,
            userMobile: user?.mobnumber,
            homeownername: user?.name,
            serviceType: bookingData.selectedService,
            date: bookingData.date,
            time: bookingData.timeSlot,
            serviceAddress: bookingData.address,
            additionalDetails: bookingData.details,
            status: "pending",
          };

        

          const response = await axios.post(
            `${API_BASE_URL}/api/bookings/createBooking`,
            backendBookingData,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (response.data.success) {
            // Clear stored booking data after successful creation
            localStorage.removeItem("pending-booking");

            const formattedDisplayDate = format(
              bookingData.date,
              "MMMM d, yyyy"
            );

            toast({
              title: "Appointment Confirmed!",
              description: `Your ${bookingData.selectedService} is scheduled for ${formattedDisplayDate} at ${bookingData.timeSlot}. You can view your booking details in your dashboard.`,
              variant: "success",
            });

            setIsProcessing(false);
            setTimeout(() => navigate("/dashboard"), 3000);
          } else {
            throw new Error(
              response.data.message || "Unable to confirm your booking"
            );
          }
        } catch (error) {
          // Fix: Properly handle errors and check for success message
          if (error.message && error.message.includes("Booking created successfully")) {
            
            localStorage.removeItem("pending-booking");
            // Show success message
            toast({
              title: "Appointment Confirmed!",
              description: "Your booking has been successfully created. You can view your booking details in your dashboard.",
              variant: "success",
            });
            
            setIsProcessing(false);
            setTimeout(() => navigate("/dashboard"), 3000);
          } else {
            // Genuine error case
           
            toast({
              title: "Booking Confirmation Failed",
              description:
                "Your payment was successful, but we couldn't confirm your booking. Our team has been notified and will contact you shortly.",
              variant: "destructive",
            });

            setIsProcessing(false);
            setTimeout(() => navigate("/dashboard"), 5000);
          }
        }
      } else if (status === "cancel") {
        toast({
          title: "Payment Not Completed",
          description:
            "Your payment process was cancelled. You can try again or select a different payment method.",
          variant: "warning",
        });

        setIsProcessing(false);
        setTimeout(() => navigate("/payment"), 3000);
      } else {
        // Handle unknown status
        toast({
          title: "Payment Status Unknown",
          description:
            "We couldn't determine the status of your payment. Please check your dashboard for booking status.",
          variant: "warning",
        });

        setIsProcessing(false);
        setTimeout(() => navigate("/dashboard"), 3000);
      }
    };

    handlePaymentStatus();
  }, [status, navigate, user, API_BASE_URL]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-6">
      {isProcessing ? (
        <>
          <div className="mb-4">
            <div className="h-12 w-12 rounded-full border-4 border-t-doit-400 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
          </div>
          <p className="text-center text-2xl font-medium">
            Processing Your Request
          </p>
          <p className="text-center text-gray-500 mt-2">
            Please wait while we finalize your booking details...
          </p>
        </>
      ) : (
        <p className="text-center text-2xl">
          You will be redirected momentarily...
        </p>
      )}
    </div>
  );
};

export default StripePaymentStatus;