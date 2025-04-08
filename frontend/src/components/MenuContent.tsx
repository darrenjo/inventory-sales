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

const mainListItems = [
  { text: "Dashboard", icon: <HomeRoundedIcon />, route: "/" },
  { text: "Products", icon: <AnalyticsRoundedIcon />, route: "/products" },
  { text: "Sales", icon: <PeopleRoundedIcon />, route: "/sales" },
  {
    text: "Color Catalogue",
    icon: <AssignmentRoundedIcon />,
    route: "/color-catalogue",
  },
];

const secondaryListItems = [
  { text: "Settings", icon: <SettingsRoundedIcon />, route: "/settings" },
  { text: "About", icon: <InfoRoundedIcon />, route: "/about" },
  { text: "Feedback", icon: <HelpRoundedIcon />, route: "/feedback" },
];

export default function MenuContent() {
  const navigate = useNavigate();
  const location = useLocation(); // Get current route

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: "space-between" }}>
      <List dense>
        {mainListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: "block" }}>
            <ListItemButton
              onClick={() => navigate(item.route)}
              // selected={location.pathname.startsWith(item.route)}
              selected={location.pathname === item.route}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <List dense>
        {secondaryListItems.map((item, index) => (
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
