/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import axios from "axios";
import InputAdornment from "@mui/material/InputAdornment";
import {
  Divider,
  TextField,
  Button,
  Typography,
  Box,
  Stack,
  Snackbar,
  Alert,
  Autocomplete,
} from "@mui/material";

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
  const [colorOptions, setColorOptions] = useState<
    { color_code: string; color: string; fabric_type: string }[]
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both products and color codes in parallel
        const [productRes, colorRes] = await Promise.all([
          axios.get(`${API_URL}/products/`),
          axios.get(`${API_URL}/colors`),
        ]);

        const rawProducts = productRes.data || [];
        const colors = colorRes.data || [];

        // Create a map for quick color_code -> fabric_type lookup
        const colorMap = new Map(
          colors.map((color: any) => [color.color_code, color.color])
        );

        // Enrich each product with fabric_type
        const enrichedProducts = rawProducts.map((product: any) => ({
          ...product,
          color_name: colorMap.get(product.color_code) || "Unknown",
        }));

        // Set the enriched products to state
        setProducts(enrichedProducts);
      } catch (error) {
        console.error("Error fetching products or colors:", error);
      }
    };

    fetchData();
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
    <Box
      component="main"
      sx={{
        px: 2,
        py: 4,
        // backgroundColor: primary,
        minHeight: "65vh",
        color: "white",
      }}
    >
      <Typography variant="h4" sx={{ mb: 2 }}>
        Add Product Stock
      </Typography>
      <Divider sx={{ borderColor: "rgba(255,255,255,0.2)", mb: 3 }} />

      <form onSubmit={handleSubmit}>
        <Stack spacing={5} maxWidth="600px" sx={{ mt: 4 }}>
          <Autocomplete
            fullWidth
            disablePortal
            options={products}
            getOptionLabel={(option: any) =>
              `${option.name} - ${option.color_code} (${option.color_name})`
            }
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={selectedProduct}
            onChange={(_event, newValue) => setSelectedProduct(newValue)}
            sx={{
              "& .MuiAutocomplete-popupIndicator": {
                backgroundColor: "#132F4C",
                borderRadius: "15px",
                color: "white",
                border: "none",
                "&:hover": {
                  backgroundColor: "#1a3e66",
                },
              },
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Product"
                required
                type="search"
                sx={{
                  "& .MuiInputLabel-root": {
                    transform: "translate(14px, 10px) scale(1)",
                  },
                  "& .MuiInputLabel-shrink": {
                    transform: "translate(5px, -18px) scale(0.75)",
                  },
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#132F4C",
                    borderRadius: 1,
                  },
                }}
              />
            )}
          />

          <TextField
            label="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            type="number"
            error={
              quantity !== "" &&
              (isNaN(Number(quantity)) || Number(quantity) <= 0)
            }
            helperText="Must be larger than 0"
            sx={{
              "& .MuiInputLabel-root": {
                transform: "translate(14px, 10px) scale(1)",
              },
              "& .MuiInputLabel-shrink": {
                transform: "translate(5px, -18px) scale(0.75)",
              },
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#132F4C",
              },
            }}
          />

          <TextField
            label="Buy Stock Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            type="number"
            onBlur={() => setPriceTouched(true)}
            error={price !== "" && isPriceInvalid}
            helperText={
              isPriceInvalid
                ? "Price must be bigger than 0"
                : "Input Price in Rupiah"
            }
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">Rp</InputAdornment>
                ),
              },
            }}
            sx={{
              input: { color: "white" },
              label: { color: "white" },
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#132F4C",
                borderRadius: 1,
              },
              "& .MuiInputLabel-shrink": {
                top: -35,
                transform: "translateY(50%)",
              },
            }}
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
