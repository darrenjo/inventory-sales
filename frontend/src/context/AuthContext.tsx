import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

interface User {
  id: string;
  username: string;
  roleId: number;
  roleName: string;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean; // Tambahkan isLoading
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // State untuk loading

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/users/profile`,
          {
            withCredentials: true,
          }
        );

        console.log("✅ User data from checkAuth:", res.data);

        setUser({
          id: res.data.user.id,
          username: res.data.user.username,
          roleId: res.data.user.roleId, // Pastikan ini benar
          roleName: res.data.user.roleName, // Pastikan ini benar
        });
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false); // Selesai fetch, set loading jadi false
      }
    };
    checkAuth();
  }, []);

  // Logging perubahan user setelah state terupdate
  useEffect(() => {
    console.log("User in ProtectedRoute:", user);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
