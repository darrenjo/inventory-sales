import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// Define user shape
interface User {
  id: string;
  username: string;
  roleId: number;
  roleName: string;
}

// Define context shape
interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
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

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/users/profile`, {
          withCredentials: true,
        });

        console.log("✅ User data from checkAuth:", res.data);

        const roleId = res.data.user.roleId;
        const roleName = roleMap[roleId] ?? "Unknown Role";

        setUser({
          id: res.data.user.id,
          username: res.data.user.username,
          roleId,
          roleName,
        });
      } catch (error) {
        console.error("❌ Error fetching user:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading }}>
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
