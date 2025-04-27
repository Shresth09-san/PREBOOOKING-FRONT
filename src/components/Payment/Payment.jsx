import React, { useEffect, useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Payment = () => {
  const [orderID, setOrderID] = useState("");
  const [error, setError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("paypal"); // Default to PayPal
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const Stripepublishablekey = import.meta.env.VITE_STRIPE_PUBLISHABLE_key;
  const stripePromise = loadStripe(Stripepublishablekey); // test publishable key
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // test API base URL
  const { toast } = useToast();
  const {
    getServicePrice,
    selectedService,
    price,
    setPrice,
    user,
    date,
    setDate,
    timeSlot,
    setTimeSlot,
    address,
    setAddress,
    details,
    setDetails,
    checkPendingbooking,
  } = useAuth();

  // Replace with real cart items
  const cleanedPrice = price.replace("$", "").trim();
  const cart = [{ name: selectedService, price: cleanedPrice }];

  // Calculate total price for display
  const totalPrice = cart
    .reduce((total, item) => {
      return total + parseFloat(item.price);
    }, 0)
    .toFixed(2);

  // PayPal integration
  const createOrder = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/orders", {
        cart,
      });
      const orderData = response.data;
      if (!orderData.id) {
        throw new Error("No order ID returned from backend");
      }
      setOrderID(orderData.id);
      return orderData.id;
    } catch (error) {
      console.error("❌ Error creating order:", error);
      setError("Failed to create order. Please try again.");
      throw error;
    }
  };

  const onApprove = async (data) => {
    try {
      // Notify backend to capture payment
      await axios.post(
        `http://localhost:5000/api/orders/${data.orderID}/capture`
      );

      // After successful payment, create the booking
      await createBooking();
      toast({
        title: "Payment Successful",
        description: `Your payment has been processed successfully And Your ${selectedService} appointment has been confirmed.`,
        status: "success", // Customize status as success or error
      });

      // Redirect to the dashboard
      navigate("/dashboard");
    } catch (error) {
      setError("Payment capture failed. Please contact support.");
      toast({
        title: "Payment Error",
        description: "Payment capture failed. Please contact support.",
        status: "error", // Customize status as success or error
      });
    }
  };

  // Function to create booking after successful payment
  const createBooking = async () => {
    try {
      const bookingData = {
        userId: user?.userid,
        useremail: user?.email,
        userMobile: user?.mobnumber,
        homeownername: user?.name,
        serviceType: selectedService,

        date: date, // current date as an example
        time: timeSlot, // Example time, replace with actual time slot
        serviceAddress: address, // Replace with actual address
        additionalDetails: details, // Replace with actual details
        status: "pending",
      };

      const response = await axios.post(
        `${API_BASE_URL}/api/bookings/createBooking`,
        bookingData
      );

      if (response.status === 201) {
        localStorage.removeItem("pending-booking");
        checkPendingbooking();
        return response.data;
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      throw new Error("Failed to create booking.");
    }
  };

  const handleClick = async () => {
    const stripe = await stripePromise;
    setPaymentMethod("stripe");
    setLoading(true);

    try {
      const { data: session } = await axios.post(
        `${API_BASE_URL}/api/stripe/create-checkout-session`,
        {
          service: selectedService,
          price: price,
        }
      );

      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      // if (result.status === "success") {
      //   // After successful Stripe payment, create booking
       
      //   toast({
      //     title: "Booking Successful",
      //     description: `Your payment has been processed successfully And Your ${selectedService} appointment has been confirmed.`,
      //     variant: "success",
      //   });
      //   navigate("/dashboard");
      // } else if (result.status === "cancel") {
      //   navigate("/signup");
      // }

      // if (result.error) {
      //   alert(result.error.message);
      // }
    } catch (error) {
      console.error("Stripe Checkout error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const clientID = import.meta.env.VITE_PAYPAL_CLIENTID;
  if (!clientID) {
    return (
      <div className="text-red-500 p-4">
        Error: PayPal Client ID not configured.
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto bg-white rounded-lg shadow-lg p-8 my-8">
      <h2 className="text-3xl font-bold text-center mb-8 text-black">
        Complete Your Purchase
      </h2>

      {/* Order Summary */}
      <div className="mb-8 bg-gray-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4 text-black">Order Summary</h3>
        <div className="border-b border-gray-200 pb-4">
          {cart.map((item, index) => (
            <div key={index} className="flex justify-between mb-2">
              <span className="text-black">{item.name}</span>
              <span className="font-medium text-black">
                ${parseFloat(item.price).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
        <div className="flex justify-between font-bold mt-4 text-lg text-black">
          <span>Total:</span>
          <span>${totalPrice} USD</span>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-black">
          Select Payment Method
        </h3>
        <div className="flex gap-4">
          <button
            className={`flex-1 py-3 px-4 rounded-lg text-center font-medium transition-colors ${
              paymentMethod === "paypal"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-black hover:bg-gray-200"
            }`}
            onClick={() => setPaymentMethod("paypal")}
          >
            PayPal
          </button>
          <button
            className={`flex-1 py-3 px-4 rounded-lg text-center font-medium transition-colors ${
              paymentMethod === "stripe"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-black hover:bg-gray-200"
            }`}
            onClick={handleClick}
          >
            Credit Card
          </button>
        </div>
      </div>

      {/* Payment Buttons */}
      <div className="mt-6">
        {paymentMethod === "paypal" ? (
          <div className="paypal-button-container">
            <PayPalScriptProvider
              options={{ clientId: clientID, currency: "USD" }}
            >
              <PayPalButtons
                createOrder={createOrder}
                onApprove={onApprove}
                style={{
                  layout: "vertical",
                  color: "blue",
                  shape: "rect",
                  label: "pay",
                }}
                fundingSource={undefined}
                forceReRender={[clientID]}
              />
            </PayPalScriptProvider>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <button
              className="w-full bg-indigo-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md disabled:bg-indigo-300 disabled:cursor-not-allowed"
              onClick={handleClick}
              disabled={loading}
            >
              {loading ? "Redirecting to Stripe..." : "Pay with Credit Card"}
            </button>
          </div>
        )}
      </div>

      {/* Secure Payment Message */}
      <div className="mt-8 text-center text-sm text-black">
        <p className="flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          Secure payment processed through PayPal or Stripe
        </p>
        <p className="mt-2">
          Your information is protected using industry-standard encryption
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
          <p className="font-medium">Error</p>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default Payment;
