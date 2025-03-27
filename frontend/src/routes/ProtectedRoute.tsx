import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Ambil data user dari context

const ProtectedRoute = ({ allowedRoles }: { allowedRoles: number[] }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>; // Tampilkan loading sementara

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
