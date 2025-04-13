import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
// import Home from "../pages/HomePage";
import Admin from "../pages/Admin";
import Sales from "../pages/Sales";
import ColorCatalogue from "../pages/ColorCatalogue";
import Products from "../pages/Products";
import ProductDetail from "../pages/ProductDetail";
import Stock from "../pages/Stock";
// import Inventory from "../pages/Inventory";
// import Sales from "../pages/Sales";
import Unauthorized from "../pages/Unauthorized";
import ProtectedRoute from "../routes/ProtectedRoute";
import SplashScreen from "../pages/SplashScreen";
import NotFound from "../pages/NotFound";
import { AnimatePresence } from "framer-motion";
import MainLayout from "../layouts/MainLayout";
import TransactionList from "../pages/TransactionList";

// function App() {
//   return (
//     <AnimatePresence mode="wait">
//       <Router>
//         <Routes>
//           {/* Route bebas diakses semua orang */}
//           <Route path="/login" element={<Login />} />
//           <Route path="/unauthorized" element={<Unauthorized />} />

//           {/* Route hanya bisa diakses kalau sudah login */}
//           <Route element={<ProtectedRoute allowedRoles={[1, 2, 3, 4]} />}>
//             <Route path="/splash" element={<SplashScreen />} />
//             <Route path="/" element={<Home />} />
//             <Route path="/products" element={<Products />} />
//             <Route path="/color-catalogue" element={<ColorCatalogue />} />
//             <Route path="/stock" element={<Stock />} />
//           </Route>

//           {/* Route khusus superadmin */}
//           <Route element={<ProtectedRoute allowedRoles={[1]} />}>
//             <Route path="/admin" element={<Admin />} />
//             <Route path="/product-details" element={<ProductDetail />} />
//             <Route path="/colors" element={<ColorCatalogue />} />
//           </Route>

//           {/* Route khusus Sales Staff */}
//           <Route element={<ProtectedRoute allowedRoles={[1, 4]} />}>
//             <Route path="/sales" element={<Sales />} />
//           </Route>

//           <Route path="*" element={<NotFound />} />
//         </Routes>
//       </Router>
//     </AnimatePresence>
//   );
// }

function App() {
  return (
    <AnimatePresence mode="wait">
      <Router>
        <Routes>
          {/* Public routes */}
          {publicRoutes()}

          {/* Protected routes with MainLayout wrapper */}
          <Route element={<ProtectedRoute allowedRoles={[1, 2, 3, 4]} />}>
            <Route>{loadingRoutes()}</Route>
          </Route>

          {/* Protected routes with MainLayout wrapper */}
          <Route element={<ProtectedRoute allowedRoles={[1, 2, 3, 4]} />}>
            <Route element={<MainLayout />}>{mainRoutes()}</Route>
          </Route>

          {/* Superadmin routes with MainLayout wrapper */}
          <Route element={<ProtectedRoute allowedRoles={[1]} />}>
            <Route element={<MainLayout />}>{superadminRoutes()}</Route>
          </Route>

          {/* Sales Staff routes with MainLayout wrapper */}
          <Route element={<ProtectedRoute allowedRoles={[1, 4]} />}>
            <Route element={<MainLayout />}>{salesRoutes()}</Route>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AnimatePresence>
  );
}

const publicRoutes = () => (
  <>
    <Route path="/login" element={<Login />} />
    <Route path="/unauthorized" element={<Unauthorized />} />
  </>
);
const loadingRoutes = () => (
  <>
    <Route path="/splash" element={<SplashScreen />} />
  </>
);

const mainRoutes = () => (
  <>
    <Route path="/" element={<Dashboard />} />
    <Route path="/products" element={<Products />} />
    <Route path="/color-catalogue" element={<ColorCatalogue />} />
    <Route path="/stock" element={<Stock />} />
    <Route path="/transactions" element={<TransactionList />} />
  </>
);

const superadminRoutes = () => (
  <>
    <Route path="/admin" element={<Admin />} />
    <Route path="/product-details" element={<ProductDetail />} />
    <Route path="/colors" element={<ColorCatalogue />} />
  </>
);

const salesRoutes = () => (
  <>
    <Route path="/sales" element={<Sales />} />
  </>
);

export default App;
