import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
  useCallback
} from "react";
import axios from "axios";
import { set } from "gsap";
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
  GetUserCounts: () => Promise<void>; // ✅ already there
  userCounts: {
    homeownerCount: number;
    serviceProviderCount: number;
    adminCount: number;
    totalUsers: number;
  }; 
  setBookings: (bookings: any) => void;
  Bookings: any;
  fetchBookings: () => Promise<any[]>;
  fetchProviderBookings:()=> Promise<any[]>
  getTotalBookings:()=>Promise<any[]>
  completedBookings:any,
  pendingBookings:any,
  getUserdetails:()=>Promise<any>
  sethomeownerdetails:(homeownerDetails:any)=>void
  setproviderdetails:(providerDetails:any)=>void
  homeownerdetails:any
  providerdetails:any,
  setallusers:(allUsers:any)=>void
  allusers:any,
  setBookingDetails:(bookingDetails:any)=>void
  BookingsDetails:any
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [userCounts, setUserCounts] = useState({
    homeownerCount: 0,
    serviceProviderCount: 0,
    adminCount: 0,
    totalUsers: 0,
  });

  const [Bookings,setBookings]=useState()
  const [completedBookings,setCompletedBookings]=useState()
  const [pendingBookings,setpendingBookings]=useState()
  const [BookingsDetails,setBookingDetails]=useState()

  const [homeownerdetails,sethomeownerdetails]=useState()
  const [providerdetails,setproviderdetails]=useState()
  const [allusers,setallusers]=useState()

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const userToken = localStorage.getItem("doit-token");
      const adminToken = localStorage.getItem("admin-token");
  
      // If no tokens at all, exit early
      if (!userToken && !adminToken) {
        setLoading(false);
        return;
      }
      
      // Try admin authentication first if token exists
      if (adminToken) {
        try {
          const response = await axios.get(`${API_BASE_URL}/api/user-counts/admin`, {
            headers: {
              Authorization: `Bearer ${adminToken}`
            }
          });
          
          // Set admin user data
          setUser(response.data);
          setLoading(false);
          return; // Exit early as we've authenticated as admin
        } catch (error) {
          console.error("Error fetching admin user:", error.response?.data || error.message);
          const status = error.response?.status;
          
          if (status === 401 || status === 403) {
            localStorage.removeItem("admin-token");
            // Don't set user to null yet - we'll try the user token next
          } else {
            console.warn("Server/network error, admin token preserved.");
          }
        }
      }
      
      // Only try user authentication if admin auth failed or no admin token
      if (userToken) {
        try {
          const response = await axios.get(`${API_BASE_URL}/api/auth/user`, {
            headers: {
              Authorization: `Bearer ${userToken}`
            }
          });
          
          setUser(response.data);
        } catch (error) {
          console.error("Error fetching user:", error.response?.data || error.message);
          const status = error.response?.status;
          
          if (status === 401 || status === 403) {
            localStorage.removeItem("doit-token");
            setUser(null);
          } else {
            console.warn("Server/network error, token preserved.");
          }
        }
      } else if (!adminToken) {
        // If we got here with no valid tokens, clear user state
        setUser(null);
      }
      
      setLoading(false);
    };
    
    fetchUser();
  }, []);

  const logout = () => {
    if (localStorage.getItem("doit-token")) {
      localStorage.removeItem("doit-token");
      setUser(null);
    } else if (localStorage.getItem("admin-token")) {
      localStorage.removeItem("admin-token");
      setUser(null);
    }
  };

  const login = async (mobnumber: string, password: string, role: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobnumber, password, role }), // 👈 include role
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const { token, user } = await response.json();
   
      localStorage.setItem("doit-token", token);
      setUser(user); // Assume setUser updates your React app's user state
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
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("admin-token", data.token); // Store admin token
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
      const response = await axios.get(`${API_BASE_URL}/api/bookings/getbookingdata`, {
        params: { userId: user?.userid }
     
      });
  
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
  
      console.log("API response structure:", response.data);
      return [];
    } catch (error) {
      console.error("Error fetching bookings", error);
      return [];
    }
  };

  const fetchProviderBookings = async () => {
    try {
      // Try with provider-specific endpoint
      const response = await axios.get(`${API_BASE_URL}/api/bookings/getProviderbookings`, {
        params: { providerId: user?.userid }
      });
      
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      
      console.log("Provider API response structure:", response.data);
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
      console.log(data)
    } catch (errr) {
      console.error("Error fetching user counts:", errr);
    }
  };


  const getTotalBookings= useCallback (async()=>{
    try{
      const response = await axios.get(`${API_BASE_URL}/api/user-counts/TotalBookings`);
      if (response.data && response.data.success) {
        return response.data.totalBookings;
      }
      setBookings(response.data.totalBookings)
      setCompletedBookings(response.data.completedBookings)
      setpendingBookings(response.data.pendingBookings)
      setBookingDetails(response.data.allBookings)

      console.log("Total bookings API response structure:", response.data);
      return 0;
    }
    catch(error){
      console.error("Error fetching total bookings", error);
      return 0;
    }
  },[API_BASE_URL])

  const getUserdetails = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/user-counts/user-details`);
      
      if (response.data) {
        const homeowners = response.data.homeowners;
        const serviceProviders = response.data.serviceProviders;
        const allusers = response.data.allUsers;
        
        sethomeownerdetails(homeowners);
        setproviderdetails(serviceProviders);
        setallusers(allusers);
        return { homeowners, serviceProviders };
      }
      
      console.log("Unexpected response:", response.data);
      return null;
    } catch (error) {
      console.error("Error fetching user details", error);
      return null;
    }
  }, [API_BASE_URL]); // Only depends on API_BASE_URL
  
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
        getUserdetails,
        homeownerdetails,
        providerdetails,
        allusers
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
}