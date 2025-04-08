import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Ambil data user dari context
import { CircularProgress, Typography, Box } from "@mui/material";

const ProtectedRoute = ({ allowedRoles }: { allowedRoles: number[] }) => {
  const { user, isLoading } = useAuth();

  if (isLoading)
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#0A1929", // Dark background
          color: "white", // Light text
        }}
      >
        <CircularProgress sx={{ color: "#64B5F6" }} /> {/* Light blue loader */}
        <Typography variant="body1" sx={{ mt: 2, fontWeight: "bold" }}>
          Fetching data, please wait...
        </Typography>
      </Box>
    ); // Tampilkan loading sementara

  if (!user) {
    console.log("🔴 User is null, redirecting to /login");
    return <Navigate to="/login" replace />;
  }

  console.log("🟢 User in ProtectedRoute:", user);
  console.log("✅ Allowed roles:", allowedRoles);

  // if (!user.roleId || !allowedRoles.includes(user.roleId)) {
  //   console.log(
  //     `❌ User role ${user.roleId} is not in allowed roles ${allowedRoles}`
  //   );
  //   return <Navigate to="/" replace />;
  // }

  if (!allowedRoles.includes(user.roleId)) {
    console.log(`User role (${user.roleId}) not allowed!`);
    localStorage.setItem(
      "unauthorizedMessage",
      "Anda tidak memiliki akses ke halaman ini."
    );
    return <Navigate to="/unauthorized" replace />;
  }

  console.log("✅ Access granted!");

  return <Outlet />;
};

export default ProtectedRoute;
