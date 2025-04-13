import { useNavigate, useLocation } from "react-router-dom";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import HelpRoundedIcon from "@mui/icons-material/HelpRounded";
import { useAuth } from "../context/AuthContext";

export default function MenuContent() {
  const { user } = useAuth(); // ambil role dari authcontext
  const navigate = useNavigate();
  const location = useLocation();

  const roleId = user?.roleId;
  const mainListItems = [
    { text: "Dashboard", icon: <HomeRoundedIcon />, route: "/", roles: [1, 2, 3, 4] },
    { text: "Products", icon: <AnalyticsRoundedIcon />, route: "/products", roles: [1, 2, 3, 4] },
    { text: "Sales", icon: <PeopleRoundedIcon />, route: "/sales", roles: [1, 2, 4] },
    { text: "Color Catalogue", icon: <AssignmentRoundedIcon />, route: "/color-catalogue", roles: [1, 2, 3, 4] },
    { text: "Stocks", icon: <AssignmentRoundedIcon />, route: "/stock", roles: [1, 2, 3] },
    { text: "Customers", icon: <PeopleRoundedIcon />, route: "/customers", roles: [1, 2] },
  ];

  const secondaryListItems = [
    { text: "Settings", icon: <SettingsRoundedIcon />, route: "/settings", roles: [1, 2] },
    { text: "About", icon: <InfoRoundedIcon />, route: "/about", roles: [1, 2] },
    { text: "Feedback", icon: <HelpRoundedIcon />, route: "/feedback", roles: [1, 2] },
  ];

  const filteredMainItems = roleId
  ? mainListItems.filter((item) => item.roles.includes(roleId))
  : [];

  const filteredSecondaryItems = roleId
  ? secondaryListItems.filter((item) => item.roles.includes(roleId))
  : [];

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: "space-between" }}>
      <List dense>
        {filteredMainItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: "block" }}>
            <ListItemButton
              onClick={() => navigate(item.route)}
              selected={location.pathname === item.route}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <List dense>
        {filteredSecondaryItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: "block" }}>
            <ListItemButton
              onClick={() => navigate(item.route)}
              selected={location.pathname.startsWith(item.route)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}

