import { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Typography,
  TextField,
  TableCell,
  TableRow,
  Pagination,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { checkAuth, api } from "../services/api";
import GenericTable from "../components/GenericTable";

interface Product {
  id: string;
  name: string;
  category: string;
  color_code: string;
  Batches: { quantity: number }[];
}

interface Column {
  label: string;
  key: string;
  sortable?: boolean;
  align?: "right" | "center" | "left";
}

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAuth = async () => {
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) {
        navigate("/login");
      }
    };

    verifyAuth();
  }, [navigate]);

  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({
    key: "",
    direction: "asc",
  });

  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/products");
        setProducts(res.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  const totalQuantity = (Batches: { quantity: number }[] = []) => {
    return Batches.reduce((sum, batch) => sum + (batch.quantity || 0), 0);
  };

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const aValue =
      sortConfig.key === "stocks"
        ? totalQuantity(a.Batches)
        : (a as any)[sortConfig.key];
    const bValue =
      sortConfig.key === "stocks"
        ? totalQuantity(b.Batches)
        : (b as any)[sortConfig.key];

    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const paginatedProducts = sortedProducts.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const columns: Column[] = [
    { key: "name", label: "Product", sortable: true },
    { key: "category", label: "Category", sortable: true },
    { key: "colorCode", label: "Color Code", sortable: true },
    {
      key: "totalStocks",
      label: "Stocks",
      align: "right" as "right",
      sortable: true,
    },
  ]; // .filter((col) => visibleColumns.includes(col.key))

  // const [visibleColumns, setVisibleColumns] = useState<string[]>(
  //   columns.map((col) => col.key)
  // );
  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
    const saved = localStorage.getItem("visibleColumns");
    return saved
      ? JSON.parse(saved)
      : ["name", "category", "colorCode", "totalStocks"];
  });

  useEffect(() => {
    localStorage.setItem("visibleColumns", JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  const filteredColumns = columns.filter((col) =>
    visibleColumns.includes(col.key)
  );

  // const renderRow = (product: Product) => (
  //   <TableRow
  //     key={product.id}
  //     hover
  //     onClick={() => navigate(`/products/${product.id}`)}
  //     sx={{ cursor: "pointer" }}
  //   >
  //     <TableCell>{product.name}</TableCell>
  //     <TableCell>{product.category}</TableCell>
  //     <TableCell>{product.color_code}</TableCell>
  //     <TableCell align="right">{totalQuantity(product.Batches)}</TableCell>
  //   </TableRow>
  // );

  const renderCell = (product: Product, key: string) => {
    switch (key) {
      case "name":
        return <TableCell>{product.name}</TableCell>;
      case "category":
        return <TableCell>{product.category}</TableCell>;
      case "colorCode":
        return <TableCell>{product.color_code}</TableCell>;
      case "totalStocks":
        return (
          <TableCell align="right">{totalQuantity(product.Batches)}</TableCell>
        );
      default:
        return null;
    }
  };

  const renderRow = (product: Product) => (
    <TableRow
      key={product.id}
      hover
      onClick={() => navigate(`/product-details`, { state: { product } })}
      sx={{ cursor: "pointer" }}
    >
      {visibleColumns.map((key) => renderCell(product, key))}
    </TableRow>
  );

  const handleExportCSV = () => {
    const headers = visibleColumns.join(",");
    const rows = sortedProducts.map((product) =>
      visibleColumns
        .map((key) => {
          if (key === "totalStocks") return totalQuantity(product.Batches);
          if (key === "colorCode") return product.color_code;
          return (product as any)[key];
        })
        .join(",")
    );
    const csvContent = [headers, ...rows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // const renderRow = (product: Product) => (
  //   <TableRow
  //     key={product.id}
  //     hover
  //     onClick={() => navigate(`/products/${product.id}`)}
  //     sx={{ cursor: "pointer" }}
  //   >
  //     {visibleColumns.includes("name") && <TableCell>{product.name}</TableCell>}
  //     {visibleColumns.includes("category") && (
  //       <TableCell>{product.category}</TableCell>
  //     )}
  //     {visibleColumns.includes("colorCode") && (
  //       <TableCell>{product.color_code}</TableCell>
  //     )}
  //     {visibleColumns.includes("totalStocks") && (
  //       <TableCell align="right">{totalQuantity(product.Batches)}</TableCell>
  //     )}
  //   </TableRow>
  // );

  return (
    <Container sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" fontWeight="bold" align="center" gutterBottom>
          📊 Inventory Dashboard
        </Typography>
        <TextField
          label="Search Product"
          variant="outlined"
          fullWidth
          sx={{ mb: 2 }}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <FormGroup row sx={{ mb: 2 }}>
          {["name", "category", "colorCode", "totalStocks"].map((key) => (
            <FormControlLabel
              key={key}
              control={
                <Checkbox
                  checked={visibleColumns.includes(key)}
                  onChange={() => {
                    setVisibleColumns((prev) =>
                      prev.includes(key)
                        ? prev.filter((col) => col !== key)
                        : [...prev, key]
                    );
                  }}
                />
              }
              label={key}
            />
          ))}
        </FormGroup>
        <GenericTable
          columns={filteredColumns}
          // data={sortedProducts}
          data={paginatedProducts}
          renderRow={renderRow}
          sortConfig={sortConfig}
          onSort={handleSort}
        />

        <Pagination
          count={Math.ceil(sortedProducts.length / rowsPerPage)}
          page={page}
          onChange={(_, value) => setPage(value)}
          sx={{ mt: 2, display: "flex", justifyContent: "center" }}
        />
        <Button variant="outlined" onClick={handleExportCSV} sx={{ mb: 2 }}>
          Export CSV
        </Button>
      </Paper>
    </Container>
  );
};

export default Home;
