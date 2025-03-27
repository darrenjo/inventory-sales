import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext"; // Pastikan ini sesuai path

export const useLogout = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/logout`,
        {},
        { withCredentials: true }
      );
      setUser(null); // Reset user context
      navigate("/login");
      window.history.replaceState(null, "", "/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return handleLogout;
};
