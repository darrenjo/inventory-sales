import { useEffect, useState } from "react";
import {
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  TextField,
  TableSortLabel,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { checkAuth, api } from "../services/api";

interface Product {
  id: string;
  name: string;
  category: string;
  color_code: string;
  Batches: { quantity: number }[];
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

  const handleSort = (key: keyof Product | "stocks") => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (!sortConfig.key || !(sortConfig.key in a) || !(sortConfig.key in b))
      return 0;

    const key = sortConfig.key as keyof Product;

    if (a[key] < b[key]) return sortConfig.direction === "asc" ? -1 : 1;
    if (a[key] > b[key]) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

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
        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={sortConfig.key === "name"}
                    direction={sortConfig.direction}
                    onClick={() => handleSort("name")}
                  >
                    <strong>Product</strong>
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortConfig.key === "category"}
                    direction={sortConfig.direction}
                    onClick={() => handleSort("category")}
                  >
                    <strong>Category</strong>
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortConfig.key === "color_code"}
                    direction={sortConfig.direction}
                    onClick={() => handleSort("color_code")}
                  >
                    <strong>Color code</strong>
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={sortConfig.key === "stocks"}
                    direction={sortConfig.direction}
                    onClick={() => handleSort("stocks")}
                  >
                    <strong>Stocks</strong>
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.color_code}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold" }}>
                    {totalQuantity(product.Batches)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default Home;
