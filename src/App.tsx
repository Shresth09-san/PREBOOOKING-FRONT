import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import Services from "./pages/Services";
import About from "./pages/About";
import Contact from "./pages/Contact";
import { useAuth } from "@/context/AuthContext";
import AdminLogin from "./pages/AdminLogin";
import EmailLogin from "./components/SupaBase/EmailLogin";
import Loader from "@/components/ui/loader";
import Payment from "./components/Payment/Payment";
import StripePaymentStatus from "./components/Payment/StripePaymentStatus";

const queryClient = new QueryClient();

// Protected route component
const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();



  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader />
      </div>
    );

  if (!isAuthenticated || !isAdmin) {
    
    return <Navigate to="/admin-login" replace />;
  }

  return <>{children}</>;
};

// AppContent component that handles page loading and content display
const AppContent = () => {
  const [loading, setLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Only show loading on initial app load, not on route changes
    if (!initialLoadComplete) {
      setLoading(true);
      const timer = setTimeout(() => {
        setLoading(false);
        setInitialLoadComplete(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, []); // Empty dependency array means this runs only once on mount

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/services" element={<Services />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/EmailLogin" element={<EmailLogin />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/Payment" element={<Payment />} />
          <Route path="/payment-status" element={<StripePaymentStatus />} />
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  );
};

// Main App component
const App = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />

          <AppContent />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;
