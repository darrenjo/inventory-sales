import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AppRoutes from "./routes"; // ini udah lengkap sama <Router />
import { AuthProvider } from "./context/AuthContext";
import { CssBaseline } from '@mui/material';

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <CssBaseline />
      <AppRoutes />
    </AuthProvider>
  </StrictMode>
);
