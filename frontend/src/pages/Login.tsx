import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  LockOutlined,
  PersonOutlined,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { api, checkAuth } from "../services/api";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const { setUser } = useAuth(); // Ambil setUser dari context
  const navigate = useNavigate();

  useEffect(() => {
    const verifyUser = async () => {
      const isAuthenticated = await checkAuth(); // Cek apakah user udah login
      console.log("User authenticated?", isAuthenticated);

      if (isAuthenticated) {
        navigate("/"); // Kalau udah login, langsung lempar ke home
      }
    };
    verifyUser();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (username === "" || password === "") {
      setError("Username and password are required.");
      setOpenSnackbar(true);
      return;
    }

    try {
      const res = await api.post(
        "/auth/login",
        { username, password },
        { withCredentials: true }
      );

      console.log("Login response:", res.data); // Cek hasil login

      setUser({
        ...res.data.user,
        roleId: res.data.user.role, // Mapping role ke roleId
      });
      console.log("User after login:", res.data.user); // Cek setelah update

      navigate("/"); // Redirect ke home/dashboard
    } catch (err) {
      setError("Invalid username or password");
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
    setError("");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Card
        className="w-full max-w-md shadow-lg rounded-lg"
        sx={{
          maxWidth: 400,
          boxShadow: "0 15px 30px rgba(0,0,0,0.2)",
          borderRadius: "16px",
        }}
      >
        <CardContent className="p-8 space-y-6">
          <div className="text-center">
            <Typography
              variant="h4"
              className="font-bold text-gray-800 mb-2"
              sx={{ fontWeight: 700 }}
            >
              Welcome Back
            </Typography>
            <Typography variant="body1" className="text-gray-500 mb-6">
              Sign in to continue to your account
            </Typography>
          </div>

          {error && (
            <Alert severity="error" onClose={handleCloseSnackbar}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <TextField
              fullWidth
              label="Username"
              variant="outlined"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlined className="text-gray-500" />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: "12px",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(0,0,0,0.23)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "primary.main",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "primary.main",
                  },
                },
              }}
            />
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? "text" : "password"}
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined className="text-gray-500" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: "12px",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(0,0,0,0.23)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "primary.main",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "primary.main",
                  },
                },
              }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              className="py-3 rounded-xl"
              sx={{
                backgroundColor: "primary.main",
                "&:hover": {
                  backgroundColor: "primary.dark",
                },
                textTransform: "none",
                fontWeight: 600,
                boxShadow: "0 8px 15px rgba(0,0,0,0.2)",
              }}
            >
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="error"
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Login;
