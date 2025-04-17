/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !isLoading) {
      console.log("User already logged in, redirecting to home");
      navigate("/splash");
    }
  }, [isLoading, navigate, user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      console.log("Attempting login with username:", username);
      await login(username, password);
      console.log("Login successful, redirecting to splash screen");
      navigate("/splash");
    } catch (err: any) {
      if (err.response) {
        if (err.response.status === 401) {
          setError("Invalid username or password.");
        } else if (err.response.status === 403) {
          setError("Your account is inactive. Please contact support.");
        } else {
          setError("An unexpected error occurred. Please try again.");
        }
      } else {
        setError("Unable to connect to the server. Please try again later.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0A1929",
        padding: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          backgroundColor: "#132F4C",
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
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            maxWidth: "400px",
          }}
        >
          <img
            src="https://media.tenor.com/4HkLW40pwKgAAAAm/patrick-patrick-star.webp"
            alt="Welcome or Logo"
            width={300}
            style={{ borderRadius: 12 }}
          />
        </Box>

        <Card sx={{ flex: 1, backgroundColor: "#132F4C" }}>
          <CardContent sx={{ padding: 5 }}>
            <Typography
              variant="h5"
              sx={{ textAlign: "center", fontWeight: "bold", marginBottom: 2, color: "white" }}
            >
              Welcome Back 👋
            </Typography>
            <Typography
              variant="body2"
              sx={{
                textAlign: "center",
                marginBottom: 3,
                color: "white",
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
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {/* Username Field */}
                <TextField
                  label="Username"
                  variant="outlined"
                  fullWidth
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isSubmitting}
                  sx={{
                    backgroundColor: "#0A1929",
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#0A1929",
                      borderRadius: "12px",
                      color: "white",
                    },
                    "& .MuiInputLabel-root": {
                      color: "#90caf9",
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#90caf9",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#64b5f6",
                    },
                    "& .MuiOutlinedInput-input": {
                      color: "white",
                    },
                  }}
                />

                {/* Password Field */}
                <TextField
                  label="Password"
                  type="password"
                  variant="outlined"
                  fullWidth
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  sx={{
                    backgroundColor: "#0A1929",
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#0A1929",
                      borderRadius: "12px",
                      color: "white",
                    },
                    "& .MuiInputLabel-root": {
                      color: "#90caf9",
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#90caf9",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#64b5f6",
                    },
                    "& .MuiOutlinedInput-input": {
                      color: "white",
                    },
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ padding: "12px 0", borderRadius: "12px" }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <CircularProgress size={24} /> : "Login"}
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
