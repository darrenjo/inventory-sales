import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "../components/Layout";
import Login from "../pages/Login";
import Home from "../pages/Home";
import Admin from "../pages/Admin";
import Sales from "../pages/Sales";
// import Inventory from "../pages/Inventory";
// import Sales from "../pages/Sales";
import Unauthorized from "../pages/Unauthorized";
import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Route bebas diakses semua orang */}
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Route hanya bisa diakses kalau sudah login */}
        <Route element={<ProtectedRoute allowedRoles={[1, 2, 3, 4]} />}>
          <Route
            path="/"
            element={
              <Layout>
                <Home />
              </Layout>
            }
          />
        </Route>

        {/* Route khusus superadmin */}
        <Route element={<ProtectedRoute allowedRoles={[1]} />}>
          <Route path="/admin" element={<Admin />} />
        </Route>

        {/* Route khusus Owner dan Inventory Staff */}
        {/* <Route element={<ProtectedRoute allowedRoles={[2, 3]} />}>
          <Route path="/inventory" element={<Inventory />} />
        </Route> */}

        {/* Route khusus Sales Staff */}
        <Route element={<ProtectedRoute allowedRoles={[4]} />}>
          <Route path="/sales" element={<Sales />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default AppRoutes;
