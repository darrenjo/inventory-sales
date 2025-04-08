import axios from "axios";
axios.defaults.withCredentials = true;

const API_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const checkAuth = async (): Promise<boolean> => {
  try {
    const res = await axios.get(`${API_URL}/users/profile`, {
      withCredentials: true, // Ensure cookies are sent to the server
    });
    return res.data; // Assuming your API returns the user data or true/false
  } catch (error) {
    console.log("Auth check failed:", error);
    return false; // If error (e.g., 401 Unauthorized), return false for not authenticated
  }
};

export const login = async (username: string, password: string) => {
  return await axios.post(
    `${import.meta.env.VITE_API_URL}/auth/login`,
    { username, password },
    { withCredentials: true }
  );
};

export const logout = async () => {
  try {
    await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
  } catch (error) {
    console.error("Logout failed:", error);
  }
};
