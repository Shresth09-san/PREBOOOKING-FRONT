import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
  useCallback,
} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface User {
  name: string;
  email?: string;
  role: "homeowner" | "provider" | "admin";
  adminId?: string;
}

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (mobnumber: string, password: string, role: string) => Promise<User>;
  adminLogin: (adminId: string, password: string) => Promise<boolean>;
  GetUserCounts: () => Promise<void>;
  userCounts: {
    homeownerCount: number;
    serviceProviderCount: number;
    adminCount: number;
    totalUsers: number;
  };

  setBookings: (bookings: any) => void;
  Bookings: any;
  completedBookings: any;
  setCompletedBookings: (completedBookings: any) => void;
  pendingBookings: any;
  setpendingBookings: (pendingBookings: any) => void;
  BookingsDetails: any;
  setBookingDetails: (BookingDetails: any) => void;
  fetchBookings: () => Promise<any[]>;
  fetchProviderBookings: () => Promise<any[]>;
  getTotalBookings: () => Promise<any[]>;

  getUserdetails: () => Promise<any>;
  sethomeownerdetails: (homeownerDetails: any) => void;
  setproviderdetails: (providerDetails: any) => void;
  homeownerdetails: any;
  providerdetails: any;
  setallusers: (allUsers: any) => void;
  userid?: string;
  allusers: any;

  
  servicesList: any;
  setServiceList: any;

  getServicePrice: () => Promise<any>;
  selectedService: string | null;

  setSelectedService: any;
  price: any;
  setPrice: (price: any) => void;

  date: Date | null;
  setDate: (date: Date | null) => void;
  timeSlot: string | null;
  setTimeSlot: (timeSlot: string | null) => void;
  address: string | null;
  setAddress: (address: string | null) => void;
  details: string | null;
  setDetails: (details: string | null) => void;
  checkPendingbooking: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [userCounts, setUserCounts] = useState({
    homeownerCount: 0,
    serviceProviderCount: 0,
    adminCount: 0,
    totalUsers: 0,
  });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [Bookings, setBookings] = useState();
  const [completedBookings, setCompletedBookings] = useState();
  const [pendingBookings, setpendingBookings] = useState();
  const [BookingsDetails, setBookingDetails] = useState();

  
  const [date, setDate] = useState<Date | null>(null);
  const [timeSlot, setTimeSlot] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [details, setDetails] = useState<string | null>(null);

  const [homeownerdetails, sethomeownerdetails] = useState();
  const [providerdetails, setproviderdetails] = useState();
  const [allusers, setallusers] = useState();

  const [servicesList, setServiceList] = useState([]);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [price, setPrice] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const userToken = localStorage.getItem("doit-token");
      const adminToken = localStorage.getItem("admin-token");

      if (!userToken && !adminToken) {
        setLoading(false);
        return;
      }

      try {
        const token = userToken || adminToken;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await axios.get(`${API_BASE_URL}/api/auth/user`, {
          headers,
        });
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const logout = async () => {
    try {
      const token =
        localStorage.getItem("doit-token") ||
        localStorage.getItem("admin-token");

      if (token) {
        localStorage.removeItem("doit-token");
        localStorage.removeItem("admin-token");

        await axios.post(
          `${API_BASE_URL}/api/auth/logout`,
          {},
          {
            withCredentials: true,
          }
        );

        setUser(null);
        navigate("/login");
      }
    } catch (err) {
      console.error("Logout error: ", err);
    }
  };

  const login = async (mobnumber: string, password: string, role: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ mobnumber, password, role }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const { token, user } = await response.json();
      localStorage.setItem("doit-token", token);
      setUser(user);
      return user;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const adminLogin = async (adminId: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/admin-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("admin-token", data.token);
        setUser({
          name: data.user.name,
          email: data.user.email,
          role: "admin",
          adminId: data.user.adminId,
        });

        return true;
      } else {
        console.error("Admin login failed:", data.message);
        return false;
      }
    } catch (error) {
      console.error("Admin login error:", error);
      return false;
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/bookings/getbookingdata`,
        {
          params: { userId: user?.userid },
        }
      );

      if (response.data?.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }

      return [];
    } catch (error) {
      console.error("Error fetching bookings", error);
      return [];
    }
  };

  const fetchProviderBookings = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/bookings/getProviderbookings`,
        {
          params: { providerId: user?.userid },
        }
      );
      console.log(response.data)

      if (response.data?.success && Array.isArray(response.data.data)) {
       
        return response.data.data;
      }

      return [];
    } catch (error) {
      console.error("Error fetching provider bookings", error);
      return [];
    }
  };

  const GetUserCounts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/user-counts/data`);
      const data = response.data;
      setUserCounts(data);
    } catch (errr) {
      console.error("Error fetching user counts:", errr);
    }
  };

  const getTotalBookings = useCallback(async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/user-counts/TotalBookings`
      );
      
      if (response.data) {
        // Update the context state with the data
        setBookings(response.data.totalBookings || 0);
        setCompletedBookings(response.data.completedBookings || 0);
        setpendingBookings(response.data.pendingBookings || 0);
        setBookingDetails(response.data.allBookings || []);
        
        // Return the allBookings array to match the Promise<any[]> return type
        return response.data.allBookings || [];
      }
      
      return [];
    } catch (error) {
      console.error("Error fetching total bookings", error);
      return []; // Return empty array on error to match Promise<any[]>
    }
  }, [API_BASE_URL]);

  const getUserdetails = useCallback(async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/user-counts/user-details`
      );
      if (response.data) {
        sethomeownerdetails(response.data.homeowners);
        setproviderdetails(response.data.serviceProviders);
        setallusers(response.data.allUsers);
        return {
          homeowners: response.data.homeowners,
          serviceProviders: response.data.serviceProviders,
        };
      }

      return null;
    } catch (error) {
      console.error("Error fetching user details", error);
      return null;
    }
  }, [API_BASE_URL]);

  const getServicePrice = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/price/serviceprice`
      );
      setServiceList(response.data);
    } catch (err) {
      console.error("Error fetching user details", err);
      return null;
    }
  };

  
  function checkPendingbooking() {
    if (!localStorage.getItem("pending-booking")) {
      setDate(null);
      setAddress("");
      setDetails("");
      setPrice("");
      setTimeSlot("");
      setSelectedService("");
    }
  }

  const isAuthenticated = useMemo(() => !!user, [user]);
  const isAdmin = useMemo(() => user?.role === "admin", [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        setUser,
        logout,
        isAuthenticated,
        isAdmin,
        login,
        adminLogin,
        GetUserCounts,
        userCounts,
        fetchBookings,
        fetchProviderBookings,
        getTotalBookings,
        setBookings,
        Bookings,
        completedBookings,
        pendingBookings,
        BookingsDetails,
        setCompletedBookings, 
        setpendingBookings,  
        setBookingDetails,   
        getUserdetails,
        homeownerdetails,
        providerdetails,
        allusers,
        getServicePrice,
        servicesList,
        setServiceList,
        sethomeownerdetails,
        setproviderdetails,
        setallusers,
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
        checkPendingbooking,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
