import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Paper,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Stack,
  CssBaseline,
  Snackbar,
  Alert,
} from "@mui/material";
import AppTheme from "../theme/AppTheme";
import SideMenu from "../components/SideMenu";
import ThemedTextField from "../components/ThemedTextField";
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

const API_URL = import.meta.env.VITE_API_URL;

const Sales = (props: { disableCustomTheme?: boolean }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [customerId, setCustomerId] = useState("");

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );

  useEffect(() => {
    axios
      .get(`${API_URL}/products/`)
      .then((res) => setProducts(res.data || []));
    axios
      .get(`${API_URL}/customers/`)
      .then((res) => setCustomers(res.data || []));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      sales: [
        {
          product_id: productId,
          quantity: parseInt(quantity),
        },
      ],
      customer_id: customerId || null,
    };

    try {
      await axios.post(`${API_URL}/sales/transactions`, payload);

      setSnackbarMessage("🎉 Transaction submitted successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setProductId("");
      setQuantity("");
      setCustomerId("");
    } catch (err) {
      console.error(err);

      setSnackbarMessage("❌ Failed to submit transaction.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      <Box display="flex">
        <SideMenu />
        <Container
          maxWidth="sm"
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
          }}
        >
          <Paper
            sx={{
              p: 6,
              backgroundColor: "#0A1929",
              color: "white",
              width: "100%",
            }}
            elevation={6}
          >
            <Typography variant="h4" gutterBottom align="center">
              Sales Transaction
            </Typography>

            <form onSubmit={handleSubmit}>
              <Stack spacing={4}>
                <FormControl fullWidth required>
                  <InputLabel id="product-label" sx={{ color: "white" }}>
                    Product
                  </InputLabel>
                  <Select
                    labelId="product-label"
                    value={productId}
                    label="Product"
                    onChange={(e) => setProductId(e.target.value)}
                    sx={{
                      color: "white",
                      backgroundColor: "#132F4C",
                      borderRadius: 1,
                    }}
                  >
                    {products.map((product: any) => (
                      <MenuItem key={product.id} value={product.id}>
                        {product.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <ThemedTextField
                  label="Quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  type="number"
                />

                <FormControl fullWidth>
                  <InputLabel id="customer-label" sx={{ color: "white" }}>
                    Customer (optional)
                  </InputLabel>
                  <Select
                    labelId="customer-label"
                    value={customerId}
                    label="Customer"
                    onChange={(e) => setCustomerId(e.target.value)}
                    sx={{
                      color: "white",
                      backgroundColor: "#132F4C",
                      borderRadius: 1,
                    }}
                  >
                    <MenuItem value="">None</MenuItem>
                    {customers.map((customer: any) => (
                      <MenuItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{ py: 1.5 }}
                >
                  Submit Transaction
                </Button>
              </Stack>
            </form>
          </Paper>
        </Container>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbarSeverity}
            variant="filled"
            sx={{
              width: "100%",
              fontWeight: "bold",
              color: "white",
              backgroundColor:
                snackbarSeverity === "success" ? "#4caf50" : "#f44336", // green or red
            }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </AppTheme>
  );
};

export default Sales;
