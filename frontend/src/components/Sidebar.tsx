import React from "react";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import DashboardIcon from "@mui/icons-material/Dashboard";
import InventoryIcon from "@mui/icons-material/Inventory";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PeopleIcon from "@mui/icons-material/People";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import Typography from "@mui/material/Typography";
import { useLogout } from "../utils/authUtils";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
  roleId: number; // Ambil dari ProtectedRoute setelah login
}

// Fungsi untuk mapping roleId ke roleName
const getRoleName = (roleId: number): string => {
  switch (roleId) {
    case 1:
      return "superadmin";
    case 2:
      return "owner";
    case 3:
      return "inventory";
    case 4:
      return "sales";
    default:
      return "guest"; // Jika roleId tidak dikenali
  }
};

const menuItems = {
  1: [
    // Superadmin
    { text: "Dashboard", icon: <DashboardIcon />, path: "/" },
    { text: "Inventory", icon: <InventoryIcon />, path: "/inventory" },
    { text: "Sales", icon: <ShoppingCartIcon />, path: "/sales" },
    { text: "Customers", icon: <PeopleIcon />, path: "/customers" },
  ],
  2: [
    // Owner
    { text: "Dashboard", icon: <DashboardIcon />, path: "/" },
    { text: "Inventory", icon: <InventoryIcon />, path: "/inventory" },
    { text: "Sales", icon: <ShoppingCartIcon />, path: "/sales" },
    { text: "Customers", icon: <PeopleIcon />, path: "/customers" },
  ],
  3: [
    // Inventory Staff
    { text: "Dashboard", icon: <DashboardIcon />, path: "/" },
    { text: "Inventory", icon: <InventoryIcon />, path: "/inventory" },
  ],
  4: [
    // Sales Staff
    { text: "Dashboard", icon: <DashboardIcon />, path: "/" },
    { text: "Sales", icon: <InventoryIcon />, path: "/sales" },
  ],
} as const;

const Sidebar: React.FC<SidebarProps> = ({
  open,
  onClose,
  onNavigate,
  roleId,
}) => {
  const role = getRoleName(roleId); // Convert roleId ke nama role
  const handleLogout = useLogout();

  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <List sx={{ width: 250 }}>
        {/* Header Role */}
        <ListItem>
          <Typography variant="h6" sx={{ fontWeight: "bold", mx: "auto" }}>
            {role.toUpperCase()} MENU
          </Typography>
        </ListItem>
        <Divider />

        {/* Menu Items */}
        {(menuItems[roleId as keyof typeof menuItems] || []).map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton onClick={() => onNavigate(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}

        <Divider />

        {/* Logout Button */}
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <ExitToAppIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;
