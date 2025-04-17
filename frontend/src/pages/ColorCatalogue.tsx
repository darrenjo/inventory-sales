/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState, useCallback } from "react";
import debounce from "lodash.debounce";
import {
  Stack,
  Typography,
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import { DataGrid, GridRowId } from "@mui/x-data-grid";
import ColorTable from "../components/ColorTable";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

interface Color {
  id: string;
  color_code: string;
  fabric_type: string;
  color: string;
}
const API_URL = import.meta.env.VITE_API_URL;

const ColorCatalogue = () => {
  const [colors, setColors] = useState<Color[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);

  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [alertSeverity, setAlertSeverity] = useState<"success" | "error">("success");
  const [openAlert, setOpenAlert] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const { user } = useAuth(); 
  const roleId = user?.roleId;

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const [newColor, setNewColor] = useState({
    color_code: "",
    fabric_type: "",
    color: "",
  });

  const [formErrors, setFormErrors] = useState({});

  const fetchColors = async () => {
    setLoading(true);
    try {
      const response = await api.get(`${API_URL}/colors`, {
        withCredentials: true,
      });
      setColors(response.data);
    } catch (error) {
      console.error("Error fetching colors:", error);
      showAlert("Failed to load colors", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColors();
  }, []);

  useEffect(() => {
    fetchColors();
  }, [debouncedSearch]);

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

  const filteredColors = colors.filter((color) =>
    Object.values(color).some((value) =>
      value.toLowerCase().includes(debouncedSearch.toLowerCase())
    )
  );

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setNewColor({ color_code: "", fabric_type: "", color: "" });
    setFormErrors({});
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewColor((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const errors: any = {};
    if (!newColor.color_code.trim()) errors.color_code = "Color code is required";
    if (!newColor.fabric_type.trim()) errors.fabric_type = "Fabric type is required";
    if (!newColor.color.trim()) errors.color = "Color name is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      await api.post(`${API_URL}/colors`, newColor, { withCredentials: true });
      handleCloseDialog();
      fetchColors();
      showAlert("Color added successfully", "success");
    } catch (error) {
      console.error("Error adding color:", error);
      showAlert("Failed to add color", "error");
    }
  };

  const showAlert = (message: string, severity: "success" | "error") => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setOpenAlert(true);
  };

  const handleCloseAlert = () => {
    setOpenAlert(false);
  };

  const handleRowEditCommit = async (id: GridRowId, updatedFields: any) => {
    try {
      await api.patch(`${API_URL}/colors/${id}`, updatedFields, {
        withCredentials: true,
      });
      setSnackbar({
        open: true,
        message: "Update berhasil!",
        severity: "success",
      });
      fetchColors();
    } catch (error) {
      setSnackbar({ open: true, message: "Update gagal!", severity: "error" });
      console.error(error);
    }
  };

  const handleDelete = async (id: GridRowId) => {
    try {
      await api.delete(`${API_URL}/colors/${id}`, { withCredentials: true });
      showAlert("Color deleted!", "success");
      fetchColors();
    } catch (error) {
      showAlert("Failed to delete color", "error");
      console.error(error);
    }
  };

  return (
    <Box component="main" sx={{ px: 2, py: 4, minHeight: "65vh", color: "white" }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Color Catalogue
      </Typography>
      <Divider sx={{ borderColor: "rgba(255,255,255,0.2)", mb: 3 }} />
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
          startIcon={<AddCircleIcon />} 
          onClick={handleOpenDialog}
          disabled={roleId == 4}
          sx={{ 
            whiteSpace: "nowrap",
            py: 1.5,
            '&.Mui-disabled': {
                backgroundColor: '#132F4C',
                color: 'grey',
            },
          }}
          >
          Add New Color
        </Button>
      </Stack>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <ColorTable colors={filteredColors} onDelete={handleDelete} onEditRow={handleRowEditCommit} />
      )}

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        PaperProps={{ sx: { backgroundColor: "#0A1929", color: "white" } }}
      >
        <DialogTitle>Add New Color</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, width: 400, maxWidth: "100%" }}>
            {["color_code", "fabric_type", "color"].map((field) => (
              <TextField
                key={field}
                fullWidth
                margin="normal"
                label={field.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                name={field}
                value={newColor[field as keyof typeof newColor]}
                onChange={handleInputChange}
                error={!!formErrors[field as keyof typeof formErrors]}
                helperText={formErrors[field as keyof typeof formErrors]}
                InputLabelProps={{
                  sx: { color: "rgba(255, 255, 255, 0.7)" },
                }}
                sx={{
                  "& .MuiInputLabel-root": {
                    transform: "translate(14px, 10px) scale(1)",
                  },
                  "& .MuiInputLabel-shrink": {
                    transform: "translate(5px, -18px) scale(0.75)",
                  },
                }}
              />
            ))}
            {newColor.color_code && newColor.color_code.startsWith("#") && (
              <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 2 }}>
                <Typography>Color Preview:</Typography>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    backgroundColor: newColor.color_code,
                    border: "1px solid white",
                    borderRadius: "4px",
                  }}
                />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog} sx={{ color: "white" }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSubmit}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity as any} onClose={handleCloseSnackbar}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ColorCatalogue;
