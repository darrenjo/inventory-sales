import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AppRoutes from "./routes"; // ini udah lengkap sama <Router />
import { AuthProvider } from "./context/AuthContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </StrictMode>
);
