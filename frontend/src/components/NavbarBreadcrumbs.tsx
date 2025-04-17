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

// Define routes with placeholders
const customBreadcrumbsMap: Record<
  string,
  {
    label: string | ((params: Record<string, string>) => string);
    to?: string;
  }[]
> = {
  "/product-details": [
    { label: "Products", to: "/products" },
    { label: "Product Details" },
  ],
  "/sales/create": [{ label: "Sales", to: "/sales" }, { label: "Create Sale" }],
  "/transactions/:id": [
    { label: "Transactions", to: "/transactions" },
    { label: (params) => `Transaction #${params.id}` },
  ],
};

// Utility to extract params from dynamic path
function matchPath(
  pattern: string,
  pathname: string
): null | Record<string, string> {
  const patternParts = pattern.split("/").filter(Boolean);
  const pathParts = pathname.split("/").filter(Boolean);

  if (patternParts.length !== pathParts.length) return null;
  const params: Record<string, string> = {};

  for (let i = 0; i < patternParts.length; i++) {
    const pPart = patternParts[i];
    const pathPart = pathParts[i];

    if (pPart.startsWith(":")) {
      params[pPart.slice(1)] = pathPart;
    } else if (pPart !== pathPart) {
      return null;
    }
  }
  return params;
}

// Utility to format pathname like 'user-management' -> 'User Management'
function formatPathname(pathname: string): string {
  const cleaned = pathname.replace("/", "");
  return cleaned
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function NavbarBreadcrumbs() {
  const location = useLocation();
  const pathname = location.pathname;

  let matchedPattern = null;
  let params: Record<string, string> = {};

  for (const pattern of Object.keys(customBreadcrumbsMap)) {
    const result = matchPath(pattern, pathname);
    if (result) {
      matchedPattern = pattern;
      params = result;
      break;
    }
  }

  const customItems = matchedPattern
    ? customBreadcrumbsMap[matchedPattern]
    : null;

  return (
    <StyledBreadcrumbs
      separator={<NavigateNextIcon fontSize="small" />}
      aria-label="breadcrumb"
    >
      <Link component={RouterLink} underline="hover" color="inherit" to="/">
        Dashboard
      </Link>

      {customItems ? (
        customItems.map((item, index) => {
          const label =
            typeof item.label === "function" ? item.label(params) : item.label;
          return item.to ? (
            <Link
              key={index}
              component={RouterLink}
              underline="hover"
              color="inherit"
              to={item.to}
            >
              {label}
            </Link>
          ) : (
            <Typography color="text.primary" fontWeight={600} key={index}>
              {label}
            </Typography>
          );
        })
      ) : (
        <Typography color="text.primary" fontWeight={600}>
          {formatPathname(pathname)}
        </Typography>
      )}
    </StyledBreadcrumbs>
  );
}
