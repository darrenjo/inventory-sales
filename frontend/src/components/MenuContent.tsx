import { useNavigate, useLocation } from "react-router-dom";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Divider,
  Typography,
} from "@mui/material";
import {
  ExpandLess,
  ExpandMore,
  HomeRounded as HomeRoundedIcon,
  AnalyticsRounded as AnalyticsRoundedIcon,
  PeopleRounded as PeopleRoundedIcon,
  AssignmentRounded as AssignmentRoundedIcon,
  SettingsRounded as SettingsRoundedIcon,
  InfoRounded as InfoRoundedIcon,
  HelpRounded as HelpRoundedIcon,
} from "@mui/icons-material";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function MenuContent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const roleId = user?.roleId;

  const [openGroups, setOpenGroups] = useState({
    sales: true,
    inventory: true,
    management: true,
    settings: true,
  });

  const toggleGroup = (key: keyof typeof openGroups) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const menuGroups = {
    dashboard: {
      label: null,
      items: [
        {
          text: "Dashboard",
          icon: <HomeRoundedIcon />,
          route: "/",
          roles: [1, 2, 3, 4],
        },
      ],
    },
    sales: {
      label: "Sales",
      items: [
        {
          text: "Sales",
          icon: <PeopleRoundedIcon />,
          route: "/sales",
          roles: [1, 2, 4],
        },
        {
          text: "Transactions",
          icon: <AssignmentRoundedIcon />,
          route: "/transactions",
          roles: [1, 2, 3, 4],
        },
        {
          text: "Customers",
          icon: <PeopleRoundedIcon />,
          route: "/customers",
          roles: [1, 2, 4],
        },
      ],
    },
    inventory: {
      label: "Inventory",
      items: [
        {
          text: "Products",
          icon: <AnalyticsRoundedIcon />,
          route: "/products",
          roles: [1, 2, 3, 4],
        },
        {
          text: "Stocks",
          icon: <AssignmentRoundedIcon />,
          route: "/stock",
          roles: [1, 2, 3],
        },
        {
          text: "Color Catalogue",
          icon: <AssignmentRoundedIcon />,
          route: "/color-catalogue",
          roles: [1, 2, 3, 4],
        },
      ],
    },
    management: {
      label: "Management",
      items: [
        {
          text: "User Management",
          icon: <PeopleRoundedIcon />,
          route: "/user-management",
          roles: [1, 2],
        },
        {
          text: "Role Management",
          icon: <PeopleRoundedIcon />,
          route: "/role-permission",
          roles: [1, 2],
        },
        {
          text: "Logs",
          icon: <AssignmentRoundedIcon />,
          route: "/logs",
          roles: [1, 2],
        },
      ],
    },
    settings: {
      label: "Settings & Help",
      items: [
        {
          text: "Settings",
          icon: <SettingsRoundedIcon />,
          route: "/settings",
          roles: [1, 2],
        },
        {
          text: "About",
          icon: <InfoRoundedIcon />,
          route: "/about",
          roles: [1, 2],
        },
        {
          text: "Feedback",
          icon: <HelpRoundedIcon />,
          route: "/feedback",
          roles: [1, 2],
        },
      ],
    },
  };

  const renderGroup = (key: keyof typeof menuGroups) => {
    const group = menuGroups[key];
    const filteredItems = roleId
      ? group.items.filter((item) => item.roles.includes(roleId))
      : [];

    if (filteredItems.length === 0) return null;

    if (key === "dashboard") {
      return (
        <List dense key={key}>
          {filteredItems.map((item, index) => (
            <ListItem key={index} disablePadding>
              <ListItemButton
                onClick={() => navigate(item.route)}
                selected={location.pathname === item.route}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
          <Divider sx={{ my: 1 }} />
        </List>
      );
    }

    return (
      <List dense key={key} disablePadding>
        <ListItemButton onClick={() => toggleGroup(key)}>
          <ListItemText
            primary={
              <Typography variant="subtitle2" color="text.secondary">
                {group.label}
              </Typography>
            }
          />
          {openGroups[key] ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={openGroups[key]} timeout="auto" unmountOnExit>
          <List component="div" disablePadding dense>
            {filteredItems.map((item, index) => (
              <ListItem key={index} disablePadding sx={{ pl: 3 }}>
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
        </Collapse>
        <Divider sx={{ my: 1 }} />
      </List>
    );
  };

  return (
    <>
      {Object.keys(menuGroups).map((key) =>
        renderGroup(key as keyof typeof menuGroups)
      )}
    </>
  );
}
