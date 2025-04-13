import { useLocation, Link as RouterLink } from "react-router-dom";
import { Breadcrumbs, Typography, Link } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNextRounded";
import { styled } from "@mui/material/styles";

const StyledBreadcrumbs = styled(Breadcrumbs)(({ theme }) => ({
  margin: theme.spacing(1, 0),
  "& .MuiBreadcrumbs-separator": {
    color: theme.palette.action.disabled,
  },
}));

const customBreadcrumbsMap: Record<string, { label: string; to?: string }[]> = {
  "/product-details": [
    { label: "Products", to: "/products" },
    { label: "Product Details" },
  ],
  "/sales/create": [
    { label: "Sales", to: "/sales" },
    { label: "Create Sale" },
  ],
  // Add more as needed
};

export default function NavbarBreadcrumbs() {
  const location = useLocation();
  const pathname = location.pathname;

  const customItems = customBreadcrumbsMap[pathname];

  return (
    <StyledBreadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
      <Link component={RouterLink} underline="hover" color="inherit" to="/">
        Dashboard
      </Link>

      {customItems ? (
        customItems.map((item, index) =>
          item.to ? (
            <Link
              key={index}
              component={RouterLink}
              underline="hover"
              color="inherit"
              to={item.to}
            >
              {item.label}
            </Link>
          ) : (
            <Typography color="text.primary" fontWeight={600} key={index}>
              {item.label}
            </Typography>
          )
        )
      ) : (
        // fallback default breadcrumb if no match found
        <Typography color="text.primary" fontWeight={600}>
          {pathname.replace("/", "").charAt(0).toUpperCase() + pathname.slice(2)}
        </Typography>
      )}
    </StyledBreadcrumbs>
  );
}
