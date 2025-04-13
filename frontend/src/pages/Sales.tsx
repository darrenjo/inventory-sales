/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import axios from "axios";
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

const Sales = () => {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedCustomer, setSelectedCustomer] = useState({ id: null, name: "Guest" });
  const [quantity, setQuantity] = useState("");
  const [customerId, setCustomerId] = useState("");

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );

  useEffect(() => {
    axios.get(`${API_URL}/products/`).then((res) => setProducts(res.data || []));
    axios.get(`${API_URL}/sales/customer-loyalty-stats/`).then((res) => setCustomers(res.data.data || []));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      sales: [
        {
          product_id: selectedProduct?.id,
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

      // Reset fields
      setSelectedProduct(null);
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
    <Box 
      component="main"
      sx={{
        px: 2,
        py: 4,
        // backgroundColor: primary,
        minHeight: "65vh",
        color: "white",
      }}>
          <Typography variant="h4" sx={{mb: 2}}>
            Sales Transaction
          </Typography>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', mb: 3 }} />

          <form onSubmit={handleSubmit}>
            <Stack spacing={5} maxWidth="600px" sx={{ mt: 4 }}>
              <Autocomplete
                fullWidth
                disablePortal
                options={products}
                getOptionLabel={(option: any) =>
                  `${option.name} - ${option.color_code}`
                }
                isOptionEqualToValue={(option, value) => option.id === value.id}
                value={selectedProduct}
                onChange={(_event, newValue) => {
                  setSelectedProduct(newValue);
                }}
                sx={{
                  '& .MuiAutocomplete-popupIndicator': {
                    backgroundColor: '#132F4C',
                    borderRadius: '15px',
                    color: 'white',
                    border: 'none', 
                    '&:hover': {
                      backgroundColor: '#132F4C',
                    },
                  },
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Product"
                    required
                    sx={{
                      input: { color: "white" },
                      label: { color: "white" },
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "#132F4C",
                        borderRadius: 1,
                      },
                      '& .MuiInputLabel-shrink': {
                      top: -35,
                      transform: 'translateY(50%)',
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
                error={isNaN(Number(quantity)) || Number(quantity) <= 0}
                helperText="Must be larger than 0"
                sx={{
                  input: { color: "white" },
                  label: { color: "white" },
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#132F4C",
                    borderRadius: 1,
                  },
                  '& .MuiInputLabel-shrink': {
                  top: -35,
                  transform: 'translateY(50%)',
                  },
                }}
              />

              <Autocomplete
                fullWidth
                disablePortal
                options={[{ id: null, name: "Guest" }, ...customers]}
                getOptionLabel={(option: any) =>
                  `${option.name}`
                }
                isOptionEqualToValue={(option, value) => option.id === value.id}
                value={selectedCustomer}
                onChange={(_event, newValue) => {
                  setSelectedCustomer(newValue?.id ? newValue : { id: null, name: "Guest" })
                }}
                sx={{
                  '& .MuiAutocomplete-popupIndicator': {
                    backgroundColor: '#132F4C',
                    borderRadius: '15px',
                    color: 'white',
                    border: 'none', 
                    '&:hover': {
                      backgroundColor: '#132F4C',
                    },
                  },
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Customer (Optional)"
                    required
                    sx={{
                      input: { color: "white" },
                      label: { color: "white" },
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "#132F4C",
                        borderRadius: 1,
                      },
                      '& .MuiInputLabel-shrink': {
                      top: -35,
                      transform: 'translateY(50%)',
                      },
                    }}
                  />
                )}
              />

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
  );
};

export default Sales;
