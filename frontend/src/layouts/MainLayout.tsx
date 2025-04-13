import { Outlet } from "react-router-dom";
import SideMenu from "../components/SideMenu";
// import AppNavBar from "../components/AppNavBar";
import { Box, Container } from "@mui/material";
import AppTheme from "../theme/AppTheme";
import CssBaseline from "@mui/material/CssBaseline";
import type {} from "@mui/x-date-pickers/themeAugmentation";
import type {} from "@mui/x-charts/themeAugmentation";
import type {} from "@mui/x-data-grid-pro/themeAugmentation";
import type {} from "@mui/x-tree-view/themeAugmentation";
import NavbarBreadcrumbs from "../components/NavbarBreadcrumbs";

import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from "../theme/customizations";

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

const MainLayout = (props: { disableCustomTheme?: boolean }) => {
  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: "flex" }}>
        <SideMenu />
        <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3 }, minWidth: 0 }}>
          <NavbarBreadcrumbs />
          <Container maxWidth="lg" disableGutters>
            <Outlet />
          </Container>
        </Box>
      </Box>
    </AppTheme>
  );
};

export default MainLayout;
