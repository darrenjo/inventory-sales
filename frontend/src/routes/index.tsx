import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Home from "../pages/Dashboard";
// import Home from "../pages/HomePage";
import Admin from "../pages/Admin";
import Sales from "../pages/Sales";
import ColorCatalogue from "../pages/ColorCatalogue";
import Products from "../pages/Products";
import ProductDetail from "../pages/ProductDetail";
// import Inventory from "../pages/Inventory";
// import Sales from "../pages/Sales";
import Unauthorized from "../pages/Unauthorized";
import ProtectedRoute from "../routes/ProtectedRoute";
import NotFound from "../pages/NotFound";

function App() {
  return (
    <Router>
      <Routes>
        {/* Route bebas diakses semua orang */}
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Route hanya bisa diakses kalau sudah login */}
        <Route element={<ProtectedRoute allowedRoles={[1, 2, 3, 4]} />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/color-catalogue" element={<ColorCatalogue />} />
        </Route>

        {/* Route khusus superadmin */}
        <Route element={<ProtectedRoute allowedRoles={[1]} />}>
          <Route path="/admin" element={<Admin />} />
          <Route path="/product-details" element={<ProductDetail />} />
          <Route path="/colors" element={<ColorCatalogue />} />
        </Route>

        {/* Route khusus Sales Staff */}
        <Route element={<ProtectedRoute allowedRoles={[1, 4]} />}>
          <Route path="/sales" element={<Sales />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
