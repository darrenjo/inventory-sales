import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import debounce from "lodash.debounce";
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
import InventoryTable from "../components/InventoryTable";
import ProductFormDialog from "../components/ProductFormDialog";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

interface Batch {
  id: string;
  product_id: string;
  price: number;
  quantity: number;
}

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  color_code: string;
  Batches: Batch[];
}

const Products = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const { user } = useAuth(); 
  const roleId = user?.roleId;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    debounceSearch(e.target.value);
  };

  const debounceSearch = useCallback(
    debounce((query: string) => {
      setDebouncedSearch(query);
      setPage(1);
    }, 500),
    []
  );

  const fetchInventory = async () => {
    try {
      const response = await axios.get<InventoryItem[]>(`${API_URL}/products`);
      const processedData = response.data.map((item) => ({
        ...item,
        quantity:
          item.Batches?.reduce((sum, batch) => sum + batch.quantity, 0) || 0,
      }));
      setInventory(processedData);
      console.log(roleId)
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    const filtered = inventory.filter(
      (item) =>
        item.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        item.category.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        item.color_code.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
    setFilteredInventory(filtered);
  }, [debouncedSearch, inventory]);

  const currentPageInventory = filteredInventory.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handleChangePage = (
    _event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  const handleDialogClose = () => setOpenDialog(false);
  const handleSuccess = () => {
    fetchInventory();
    setSnackbarOpen(true);
    handleDialogClose();
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
          <Typography variant="h4" sx={{mb: 2}}>
            Products
          </Typography>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', mb: 3 }} />

          <Stack
            direction="row"
            spacing={6}
            sx={{
              alignItems: "center",
              mb: 3,
              mx: 3,
              flexWrap: "wrap",
            }}
          >
            <TextField
              variant="outlined"
              placeholder="Search product"
              value={searchTerm}
              onChange={handleSearchChange}
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
              sx={{ whiteSpace: "nowrap" }}
              disabled={roleId == 4}
            >
              Add New Product
            </Button>
          </Stack>

          <InventoryTable inventory={currentPageInventory} />

          <Pagination
            count={Math.ceil(filteredInventory.length / itemsPerPage)}
            page={page}
            onChange={handleChangePage}
            color="primary"
            sx={{ mt: 3, display: "flex", justifyContent: "center" }}
          />

      <ProductFormDialog
        open={openDialog}
        onClose={handleDialogClose}
        onSuccess={handleSuccess}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          Product Sucessfully Added!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Products;
