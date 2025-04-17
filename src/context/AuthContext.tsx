import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
} from "react";
import axios from "axios";
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
  GetData: () => Promise<void>; // ✅ already there
  userCounts: {
    homeownerCount: number;
    serviceProviderCount: number;
    adminCount: number;
    totalUsers: number;
  }; 
  fetchBookings: () => Promise<any[]>;
  fetchProviderBookings:()=> Promise<any[]>
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

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("doit-token");
      if (!token) {
        setLoading(false);
        return;
      }
    
      try {
        const response = await axios.get(`${API_BASE_URL}/api/auth/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
    
        const userData = response.data;
        setUser(userData);
    
      } catch (error: any) {
        console.error("Error fetching user:", error.response?.data || error.message);
    
        const status = error.response?.status;
    
        if (status === 401 || status === 403) {
          // Remove token only for authentication errors
          localStorage.removeItem("doit-token");
          setUser(null);
        } else {
          // For other errors, keep the token and user state unchanged
          console.warn("Server/network error, token preserved.");
        }
    
      } finally {
        setLoading(false);
      }
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
      console.log(token, user);
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
  const GetData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/user-counts/data`);
      const data = response.data;
      setUserCounts(data);
    } catch (errr) {
      console.error("Error fetching user counts:", errr);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/bookings/getbookingdata`, {
        params: { userId: user?.userid }
        // ✅ Send userId as query param
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
        GetData,
        userCounts,
        fetchBookings,
        fetchProviderBookings
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
