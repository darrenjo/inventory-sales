/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// Define user shape
interface User {
  id: string;
  username: string;
  roleId: number;
  roleName: string;
}

// Define context shape with login function
interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Role mapping for rolename
const roleMap: Record<number, string> = {
  1: "Superadmin",
  2: "Owner",
  3: "Inventory Staff",
  4: "Sales Staff",
};

const API_URL = import.meta.env.VITE_API_URL;

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function to process user data consistently
  const processUserData = (userData: any): User => {
    const roleId = userData.roleId;
    const roleName = roleMap[roleId] ?? "Unknown Role";

    return {
      id: userData.id,
      username: userData.username,
      roleId,
      roleName,
    };
  };

  // Enhanced checkAuth function
  const checkAuth = async () => {
    try {
      const res = await axios.get(`${API_URL}/users/profile`, {
        withCredentials: true,
      });

      console.log("✅ User data from checkAuth:", res.data);

      if (res.data && res.data.user) {
        setUser(processUserData(res.data.user));
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("❌ Error fetching user:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Login function that properly handles role mapping
  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const loginRes = await axios.post(
        `${API_URL}/auth/login`,
        {
          username,
          password,
        },
        { withCredentials: true }
      );

      console.log("✅ Login successful:", loginRes.data);

      // After login, fetch the user profile to get complete user data including role
      const profileRes = await axios.get(`${API_URL}/users/profile`, {
        withCredentials: true,
      });

      console.log("✅ User profile after login:", profileRes.data);

      if (profileRes.data && profileRes.data.user) {
        setUser(processUserData(profileRes.data.user));
      }
    } catch (error) {
      console.error("❌ Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
      setUser(null);
    } catch (error) {
      console.error("❌ Logout failed:", error);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to access context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
