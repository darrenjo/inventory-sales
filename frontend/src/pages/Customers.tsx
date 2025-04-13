import React, { useState, useEffect } from "react";
import axios from "axios";
// import debounce from "lodash.debounce";
import {
  Divider,
  TextField,
  Button,
  Pagination,
  Typography,
  Box,
  Stack,
  Snackbar,
  Alert,
} from "@mui/material";
import CustomerTable from "../components/CustomerTable";
import CustForm from "../components/AddCustomerForm";

const API_URL = import.meta.env.VITE_API_URL;

interface Customer {
  id: string;
  name: string;
  total_spent: number;
  points: number;
  membership_tier: string;
  total_discount_received: number;
}

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const itemsPerPage = 10;

  const [openDialog, setOpenDialog] = useState(false);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API_URL}/sales/customer-loyalty-stats`);
      setCustomers(response.data.data); // Adjust for your JSON structure
    } catch (error) {
      console.error("Failed to fetch customers", error);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const currentPageCustomers = filteredCustomers.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handleDialogClose = () => setOpenDialog(false);
  const handleSuccess = () => {
    setSnackbarOpen(true);
    handleDialogClose();
    fetchCustomers();
  };

  const handleDeleteSuccess = () => {
    fetchCustomers();
    setSnackbarOpen(true);
  };

  return (
    <Box sx={{ px: 2, py: 4, minHeight: "65vh", color: "white" }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Customers
      </Typography>
      <Divider sx={{ borderColor: "rgba(255,255,255,0.2)", mb: 3 }} />

      <Stack direction="row" spacing={6} sx={{ mb: 3, mx: 3, flexWrap: "wrap" }}>
        <TextField
          variant="outlined"
          placeholder="Search customer"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            backgroundColor: "white",
            borderRadius: 1,
            flexGrow: 1,
            minWidth: "300px",
          }}
        />
        
        <Button 
          variant="contained"
            color="primary"
            onClick={() => setOpenDialog(true)}
            sx={{ whiteSpace: "nowrap" }}>
          Add New Customer
        </Button>
      </Stack>

      <CustomerTable customers={currentPageCustomers} onDeleteSuccess={handleDeleteSuccess} />

      <Pagination
        count={Math.ceil(filteredCustomers.length / itemsPerPage)}
        page={page}
        onChange={(_, value) => setPage(value)}
        sx={{ mt: 3, display: "flex", justifyContent: "center" }}
      />

      <CustForm
        open={openDialog}
        onClose={handleDialogClose}
        onSuccess={handleSuccess}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert severity="success" onClose={() => setSnackbarOpen(false)}>
          Customer Added successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};


export default Customers;
