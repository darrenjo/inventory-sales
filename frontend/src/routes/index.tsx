import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Admin from "../pages/Admin";
import Sales from "../pages/Sales";
import ColorCatalogue from "../pages/ColorCatalogue";
import Products from "../pages/Products";
import ProductDetail from "../pages/ProductDetail";
import Stock from "../pages/Stock";
import Customers from "../pages/Customers";
import Unauthorized from "../pages/Unauthorized";
import ProtectedRoute from "../routes/ProtectedRoute";
import SplashScreen from "../pages/SplashScreen";
import NotFound from "../pages/NotFound";
import { AnimatePresence } from "framer-motion";
import MainLayout from "../layouts/MainLayout";
import TransactionList from "../pages/TransactionList";
import TransactionDetail from "../pages/TransactionDetail";
import PrintableReceipt from "../pages/PrintableReceipt";
import UserManagement from "../pages/UserManagement";
import RolePermission from "../pages/RolePermission";
import LogPage from "../pages/Log";
import { SnackbarProvider } from "notistack";

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
    <SnackbarProvider maxSnack={3}>
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

            {/* Inventory Staff routes with MainLayout wrapper */}
            <Route element={<ProtectedRoute allowedRoles={[1, 2, 3]} />}>
              <Route element={<MainLayout />}>{inventoryRoutes()}</Route>
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AnimatePresence>
    </SnackbarProvider>
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
    <Route path="/customers" element={<Customers />} />
    <Route path="/transactions/:id" element={<TransactionDetail />} />
    <Route path="/print" element={<PrintableReceipt />} />
  </>
);

const superadminRoutes = () => (
  <>
    <Route path="/admin" element={<Admin />} />
    <Route path="/colors" element={<ColorCatalogue />} />
    <Route path="/user-management" element={<UserManagement />} />
    <Route path="/role-permission" element={<RolePermission />} />
    <Route path="/logs" element={<LogPage />} />
  </>
);

const inventoryRoutes = () => (
  <>
    <Route path="/product-details" element={<ProductDetail />} />
    <Route path="/print" element={<PrintableReceipt />} />
  </>
);

const salesRoutes = () => (
  <>
    <Route path="/sales" element={<Sales />} />
  </>
);

export default App;
