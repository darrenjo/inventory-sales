import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { api, checkAuth } from "../services/api";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { setUser } = useAuth(); // Get setUser from context
  const navigate = useNavigate();

  useEffect(() => {
    const verifyUser = async () => {
      const isAuthenticated = await checkAuth(); // Check if user is logged in
      console.log("User authenticated?", isAuthenticated);

      if (isAuthenticated) {
        navigate("/"); // Redirect to home/dashboard if already logged in
      }
    };
    verifyUser();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post(
        "/auth/login",
        { username, password },
        { withCredentials: true }
      );

      console.log("Login response:", res.data); // Log the login response

      setUser({
        ...res.data.user,
        roleId: res.data.user.role, // Map role to roleId
      });
      console.log("User after login:", res.data.user); // Log user data after update

      navigate("/splash"); // Redirect to home/dashboard
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError("Invalid username or password");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: "linear-gradient(to bottom right, #3b82f6, #6366f1)",
        padding: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          backgroundColor: "white",
          boxShadow: 3,
          borderRadius: 2,
          overflow: "hidden",
          maxWidth: "lg",
          width: "100%",
        }}
      >
        <Box
          sx={{
            flex: 1,
            background: `url('https://via.placeholder.com/500') no-repeat center center`,
            backgroundSize: "cover",
          }}
        ></Box>
        <Card sx={{ flex: 1 }}>
          <CardContent sx={{ padding: 4 }}>
            <Typography
              variant="h5"
              sx={{ textAlign: "center", fontWeight: "bold", marginBottom: 2 }}
            >
              Welcome Back 👋
            </Typography>
            <Typography
              variant="body2"
              sx={{
                textAlign: "center",
                marginBottom: 3,
                color: "text.secondary",
              }}
            >
              Please login to your account
            </Typography>

            {error && (
              <Typography
                sx={{
                  color: "red",
                  textAlign: "center",
                  marginBottom: 2,
                }}
              >
                {error}
              </Typography>
            )}

            <form onSubmit={handleLogin}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <TextField
                  label="Username"
                  variant="outlined"
                  fullWidth
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  sx={{ backgroundColor: "white" }}
                />
                <TextField
                  label="Password"
                  type="password"
                  variant="outlined"
                  fullWidth
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  sx={{ backgroundColor: "white" }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ padding: "12px 0" }}
                >
                  Login
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Login;
