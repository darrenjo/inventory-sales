/* eslint-disable @typescript-eslint/no-unused-vars */
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
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import CustForm from "../components/AddCustomerForm";

const API_URL = import.meta.env.VITE_API_URL;

interface CartItem {
  product: any;
  quantity: number;
}

const Sales = () => {
  const [products, setProducts] = useState([]);
  const [customersList, setCustomersList] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<any>({
    id: null,
    name: "Guest",
  });
  const [quantity, setQuantity] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");
  const [openAddCustomerDialog, setOpenAddCustomerDialog] = useState(false);

  const GUEST_OPTION = { id: null, name: "Guest" };
  const ADD_NEW_CUSTOMER_OPTION = { id: "add_new", name: "➕ Add New Customer" };

  // Load products and customers on mount
  useEffect(() => {
    axios.get(`${API_URL}/products/`).then((res) => setProducts(res.data || []));

    axios.get(`${API_URL}/sales/customer-loyalty-stats/`).then((res) => {
      const data = res.data.data || [];
      setCustomersList([GUEST_OPTION, ...data, ADD_NEW_CUSTOMER_OPTION]);
    });
  }, []);

  const handleAddToCart = () => {
    if (!selectedProduct || !quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) return;

    const existingIndex = cart.findIndex((item) => item.product.id === selectedProduct.id);

    if (existingIndex >= 0) {
      const updated = [...cart];
      updated[existingIndex].quantity += Number(quantity);
      setCart(updated);
    } else {
      setCart([...cart, { product: selectedProduct, quantity: Number(quantity) }]);
    }

    setSelectedProduct(null);
    setQuantity("");
  };

  const handleRemoveFromCart = (index: number) => {
    const updated = [...cart];
    updated.splice(index, 1);
    setCart(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      setSnackbarMessage("❌ Please add products to the cart before submitting.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    const payload = {
      sales: cart.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
      })),
      customer_id: selectedCustomer?.id || null,
    };

    try {
      await axios.post(`${API_URL}/sales/transactions`, payload);
      setSnackbarMessage("🎉 Transaction submitted successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setCart([]);
      setQuantity("");
      setSelectedProduct(null);
      setSelectedCustomer(GUEST_OPTION);
    } catch (err) {
      console.error("Transaction error:", err);
      setSnackbarMessage("❌ Failed to submit transaction.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  const handleCustomerChange = (_event: any, newValue: any) => {
    if (!newValue) {
      setSelectedCustomer(GUEST_OPTION);
    } else if (newValue.id === "add_new") {
      setOpenAddCustomerDialog(true);
    } else {
      setSelectedCustomer(newValue);
    }
  };

  const handleFormSuccess = () => {
    setOpenAddCustomerDialog(false); // Close the dialog
  };
  
  const handleCustomerAdded = async () => {
    try {
      //simpan list Customer sebelum ditambah baru
      const prevCustomerIds = new Set(customersList.map(c => c.id)); 
      
      //panggil API customer lagi untuk simpan list customer baru
      const res = await axios.get(`${API_URL}/sales/customer-loyalty-stats/`);
      const updatedCustomers = res.data.data || [];
      
      //compare dengan list baru untuk cari newCustomer nya based on compared Ids
      const newCustomer = updatedCustomers.find((c: { id: any; }) => !prevCustomerIds.has(c.id));
  
      setCustomersList([GUEST_OPTION, ...updatedCustomers, ADD_NEW_CUSTOMER_OPTION]);
      
      //null handling untuk newCustomer jika ga ktemu
      if (newCustomer) {
        setSelectedCustomer(newCustomer);
      } else {
        console.warn("No new customer found — fallback to default selection");
      }
    } catch (err) {
      console.error("Failed to fetch updated customer list:", err);
    }
  };
  

  return (
    <Box component="main" sx={{ px: 2, py: 4, minHeight: "65vh", color: "white" }}>
      <Typography variant="h4" sx={{ mb: 2 }}>Sales Transaction</Typography>
      <Divider sx={{ borderColor: "rgba(255,255,255,0.2)", mb: 3 }} />

      <form onSubmit={handleSubmit}>
        <Stack spacing={5} maxWidth="600px" sx={{ mt: 4 }}>
          {/* Customer Dropdown */}
          <Autocomplete
            fullWidth
            disablePortal
            options={customersList}
            getOptionLabel={(option: any) => option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={selectedCustomer}
            onChange={handleCustomerChange}
            sx={{
              '& .MuiAutocomplete-popupIndicator, & .MuiAutocomplete-clearIndicator': {
                backgroundColor: '#132F4C',
                borderRadius: '15px',
                color: 'white',
                border: 'none',
                margin:'0.2px',
                marginBottom:'0.1px',
                marginLeft:'5px',
                padding: '0 12px',
                '&:hover': {
                  backgroundColor: '#1a3e66',
                },
              },
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Customer"
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
            )}
          />

          {/* Product and Quantity */}
          <Box sx={{ p: 3, backgroundColor: "rgba(19, 47, 76, 0.4)", borderRadius: 2, border: "1px solid rgba(255,255,255,0.1)" }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Add Products</Typography>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', mb: 3.5 }} />
            <Stack spacing={4}>
              <Autocomplete
                fullWidth
                options={products}
                getOptionLabel={(option: any) => `${option.name} - ${option.color_code}`}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                value={selectedProduct}
                onChange={(_event, newValue) => setSelectedProduct(newValue)}
                sx={{
                  '& .MuiAutocomplete-popupIndicator': {
                    backgroundColor: '#132F4C',
                    borderRadius: '15px',
                    color: 'white',
                    border: 'none', 
                    '&:hover': {
                      backgroundColor: '#1a3e66',
                    },
                  },
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Product"
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
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                error={quantity !== "" && (isNaN(Number(quantity)) || Number(quantity) <= 0)}
                helperText="Must be larger than 0"
                className="w-full"
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

              <Button
                variant="contained"
                color="inherit"
                startIcon={<AddCircleIcon />}
                onClick={handleAddToCart}
                disabled={!selectedProduct || !quantity || isNaN(Number(quantity)) || Number(quantity) <= 0}
                sx={{ 
                  py: 1.5,
                  '&.Mui-disabled': {
                      backgroundColor: '#132F4C',
                      color: 'grey',
                  }, 
                }}
              >
                Add to Cart
              </Button>
            </Stack>
          </Box>

          {/* Cart */}
          <Paper elevation={3} sx={{ backgroundColor: "rgba(19, 47, 76, 0.4)", borderRadius: 2, p: 2, border: "1px solid rgba(255,255,255,0.1)" }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Shopping Cart</Typography>
            {cart.length === 0 ? (
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", fontStyle: "italic" }}>
                No products added to cart yet
              </Typography>
            ) : (
              <List>
                {cart.map((item, index) => (
                  <ListItem key={index} secondaryAction={
                    <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveFromCart(index)}>
                      <DeleteIcon sx={{ color: "white" }} />
                    </IconButton>
                  }>
                    <ListItemText
                      primary={`${item.product.name} - ${item.quantity}`}
                      primaryTypographyProps={{ color: "white" }}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>

          <Button
           variant="contained" 
           type="submit" 
           color="secondary" 
           sx={{ py: 2 }}>
            Submit Transaction
          </Button>
        </Stack>
      </form>

      <CustForm
        open={openAddCustomerDialog}
        onClose={() => setOpenAddCustomerDialog(false)}
        onCustomerAdded={handleCustomerAdded}
        onSuccess={handleFormSuccess}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snackbarSeverity} onClose={handleSnackbarClose} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Sales;
