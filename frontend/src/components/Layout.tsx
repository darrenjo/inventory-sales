import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useAuth } from "../context/AuthContext"; // ✅ Gunakan useAuth() yang benar
import { useLogout } from "../utils/authUtils";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth(); // Ambil user dari AuthContext
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = useLogout();

  if (isLoading) return <p>Loading...</p>; // ✅ Hindari akses user sebelum data siap

  return (
    <Box
      sx={{ display: "flex", minHeight: "100vh", width: "100vw", pt: "64px" }}
    >
      <CssBaseline />
      <Navbar
        onMenuClick={() => setIsSidebarOpen(true)}
        onLogout={handleLogout}
        username={user?.username || "Guest"} // ✅ Pakai username dari user
      />
      <Sidebar
        open={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNavigate={navigate}
        roleId={user?.roleId || 0} // ✅ Ubah ke roleId sesuai data
      />
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <Box component="main" sx={{ flexGrow: 1, p: 3, width: "100%" }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
