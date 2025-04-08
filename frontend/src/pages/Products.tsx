import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import debounce from "lodash.debounce";
import {
  TextField,
  Button,
  Pagination,
  Container,
  Typography,
  Box,
  Paper,
  Stack,
  Snackbar,
  Alert,
} from "@mui/material";
import InventoryTable from "../components/InventoryTable";
import SideMenu from "../components/SideMenu";
import AppTheme from "../theme/AppTheme";
import ProductFormDialog from "../components/ProductFormDialog";
import CssBaseline from "@mui/material/CssBaseline";
import type {} from "@mui/x-date-pickers/themeAugmentation";
import type {} from "@mui/x-charts/themeAugmentation";
import type {} from "@mui/x-data-grid-pro/themeAugmentation";
import type {} from "@mui/x-tree-view/themeAugmentation";

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

const Products = (props: { disableCustomTheme?: boolean }) => {
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
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      <Box display="flex">
        <SideMenu />
        <Container maxWidth="lg" sx={{ mt: 4, color: "white" }}>
          <Paper sx={{ p: 3, backgroundColor: "#0A1929" }}>
            <Typography variant="h4" sx={{ mb: 2, color: "white" }}>
              Products
            </Typography>

            <Stack
              spacing={4}
              sx={{
                alignItems: "center",
                mx: 3,
                pb: 5,
                mt: { xs: 8, md: 0 },
              }}
            >
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search product"
                value={searchTerm}
                onChange={handleSearchChange}
                sx={{ mb: 3, backgroundColor: "white", borderRadius: 1 }}
              />
              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 4, display: "block", mx: "auto" }}
                onClick={() => setOpenDialog(true)}
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
          </Paper>
        </Container>

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
            Produk berhasil ditambahkan!
          </Alert>
        </Snackbar>
      </Box>
    </AppTheme>
  );
};

export default Products;
