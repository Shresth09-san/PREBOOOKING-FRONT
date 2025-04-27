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
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 pt-24">
      {/* Floating Card Container */}
      <div className="absolute left-1/2 top-28 transform -translate-x-1/2 z-10 w-full max-w-2xl">
        <div className="bg-white/90 rounded-3xl shadow-2xl border-4 border-blue-300/40 p-0 overflow-hidden hover:shadow-3xl transition-all duration-300">
          <div className="relative">
            {/* Accent Stripe */}
            <div className="absolute left-0 top-0 h-full w-2 bg-gradient-to-b from-blue-400 via-indigo-400 to-blue-200 rounded-l-3xl" />
            <div className="pl-8 pr-8 py-10">
              <h2 className="text-4xl font-extrabold text-center mb-10 text-blue-900 tracking-tight drop-shadow">
                Checkout
              </h2>

              {/* Order Summary */}
              <div className="mb-10 bg-white/80 p-8 rounded-2xl shadow flex flex-col gap-4 border border-blue-100">
                <h3 className="text-2xl font-bold mb-2 text-blue-800 flex items-center gap-2">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h18" /></svg>
                  Order Summary
                </h3>
                <div className="divide-y divide-blue-100">
                  {cart.map((item, index) => (
                    <div key={index} className="flex justify-between py-2">
                      <span className="text-blue-900 font-medium">{item.name}</span>
                      <span className="font-semibold text-blue-700">
                        ${parseFloat(item.price).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between font-bold mt-4 text-xl text-blue-900">
                  <span>Total:</span>
                  <span>${totalPrice} <span className="text-base font-normal text-blue-500">USD</span></span>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="mb-10">
                <h3 className="text-2xl font-bold mb-4 text-blue-800 flex items-center gap-2">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" /><circle cx="12" cy="12" r="10" /></svg>
                  Payment Method
                </h3>
                <div className="flex gap-6">
                  <button
                    className={`flex-1 py-4 px-6 rounded-xl text-center font-semibold transition-all duration-200 border-2 ${
                      paymentMethod === "paypal"
                        ? "bg-blue-600 text-white border-blue-600 shadow-lg scale-105"
                        : "bg-white text-blue-700 border-blue-200 hover:bg-blue-50"
                    }`}
                    onClick={() => setPaymentMethod("paypal")}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <img src="https://www.paypalobjects.com/webstatic/icon/pp258.png" alt="PayPal" className="w-6 h-6" />
                      PayPal
                    </span>
                  </button>
                  <button
                    className={`flex-1 py-4 px-6 rounded-xl text-center font-semibold transition-all duration-200 border-2 ${
                      paymentMethod === "stripe"
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-lg scale-105"
                        : "bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                    }`}
                    onClick={handleClick}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <img src="https://cdn-icons-png.flaticon.com/512/196/196566.png" alt="Card" className="w-6 h-6" />
                      Credit Card
                    </span>
                  </button>
                </div>
              </div>

              {/* Payment Buttons */}
              <div className="mt-8">
                {paymentMethod === "paypal" ? (
                  <div className="paypal-button-container rounded-xl overflow-hidden shadow">
                    <PayPalScriptProvider
                      options={{ clientId: clientID, currency: "USD" }}
                    >
                      <PayPalButtons
                        createOrder={createOrder}
                        onApprove={onApprove}
                        style={{
                          layout: "vertical",
                          color: "blue",
                          shape: "pill",
                          label: "pay",
                          tagline: false,
                          height: 48,
                        }}
                        fundingSource={undefined}
                        forceReRender={[clientID]}
                      />
                    </PayPalScriptProvider>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <button
                      className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-indigo-600 hover:to-blue-600 transition-all shadow-lg disabled:bg-indigo-300 disabled:cursor-not-allowed"
                      onClick={handleClick}
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                          Redirecting to Stripe...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="10" rx="2" /><path d="M2 10h20" /></svg>
                          Pay with Credit Card
                        </span>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Secure Payment Message */}
              <div className="mt-10 text-center text-base text-blue-700">
                <p className="flex items-center justify-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-green-500"
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
                  Secure payment processed through <span className="font-semibold">PayPal</span> or <span className="font-semibold">Stripe</span>
                </p>
                <p className="mt-2 text-blue-500">
                  Your information is protected using industry-standard encryption.
                </p>
              </div>

              {/* Error Display */}
              {error && (
                <div className="mt-8 p-5 bg-red-100 text-red-800 rounded-xl border border-red-300 shadow">
                  <p className="font-bold text-lg mb-1">Error</p>
                  <p>{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
