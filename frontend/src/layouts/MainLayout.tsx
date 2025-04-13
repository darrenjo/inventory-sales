import { Outlet } from "react-router-dom";
import SideMenu from "../components/SideMenu";
// import AppNavBar from "../components/AppNavBar";
import { Box } from "@mui/material";
import AppTheme from "../theme/AppTheme";
import CssBaseline from "@mui/material/CssBaseline";
import type {} from "@mui/x-date-pickers/themeAugmentation";
import type {} from "@mui/x-charts/themeAugmentation";
import type {} from "@mui/x-data-grid-pro/themeAugmentation";
import type {} from "@mui/x-tree-view/themeAugmentation";

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
        {/* <AppNavBar /> */}
        <SideMenu />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          {/* Semua halaman yang dibungkus layout ini bakal render di sini */}
          <Outlet />
        </Box>
      </Box>
    </AppTheme>
  );
};

export default MainLayout;
