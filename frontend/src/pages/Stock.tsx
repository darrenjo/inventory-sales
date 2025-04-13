import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Paper,
  Stack,
  Snackbar,
  Alert,
  Autocomplete,
} from "@mui/material";
import ThemedTextField from "../components/ThemedTextField";

const API_URL = import.meta.env.VITE_API_URL;

const Stock = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );
  const [priceTouched, setPriceTouched] = useState(false);
  const isPriceInvalid =
    priceTouched && (isNaN(Number(price)) || Number(price) <= 0);

  useEffect(() => {
    axios
      .get(`${API_URL}/products/`)
      .then((res) => setProducts(res.data || []));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      product_id: selectedProduct?.id,
      price: parseInt(price),
      quantity: parseInt(quantity),
    };

    try {
      await axios.post(`${API_URL}/products/stock`, payload);

      setSnackbarMessage("✅ Stock added successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);

      // Reset fields
      setSelectedProduct(null);
      setPrice("");
      setQuantity("");
    } catch (err) {
      console.error(err);
      setSnackbarMessage("❌ Failed to add stock.");
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
    <Box display="flex">
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
            Add Product Stock
          </Typography>

          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <Autocomplete
                fullWidth
                disablePortal
                options={products}
                getOptionLabel={(option: any) =>
                  `${option.name} - ${option.color_code} (${option.color_name})`
                }
                isOptionEqualToValue={(option, value) => option.id === value.id}
                value={selectedProduct}
                onChange={(_event, newValue) => {
                  setSelectedProduct(newValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Product Name"
                    required
                    sx={{
                      input: { color: "white" },
                      label: { color: "white" },
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "#132F4C",
                        borderRadius: 1,
                      },
                    }}
                  />
                )}
              />

              <ThemedTextField
                label="Quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                type="number"
                error={isNaN(Number(quantity)) || Number(quantity) <= 0}
              />

              <ThemedTextField
                label="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                type="number"
                onBlur={() => setPriceTouched(true)}
                error={isPriceInvalid}
                helperText={
                  isPriceInvalid
                    ? "Harga harus lebih dari 0"
                    : "Masukkan harga jual dalam rupiah"
                }
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ py: 1.5 }}
              >
                Add Stock
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
              snackbarSeverity === "success" ? "#4caf50" : "#f44336",
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Stock;
