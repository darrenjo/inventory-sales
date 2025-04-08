import React, { useEffect, useState } from "react";
import {
  Container,
  Paper,
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
} from "@mui/material";
import { DataGrid, GridRowId } from "@mui/x-data-grid";
import ColorTable from "../components/ColorTable";
import AddIcon from "@mui/icons-material/Add";
import { api } from "../services/api";
import SideMenu from "../components/SideMenu";
import AppTheme from "../theme/AppTheme";
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

interface Color {
  id: string;
  color_code: string;
  fabric_type: string;
  color: string;
}
const API_URL = import.meta.env.VITE_API_URL;

const ColorCatalogue = (props: { disableCustomTheme?: boolean }) => {
  const [colors, setColors] = useState<Color[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [alertSeverity, setAlertSeverity] = useState<"success" | "error">(
    "success"
  );
  const [openAlert, setOpenAlert] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const [newColor, setNewColor] = useState({
    color_code: "",
    fabric_type: "",
    color: "",
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchColors();
  }, []);

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
    if (!newColor.color_code.trim())
      errors.color_code = "Color code is required";
    if (!newColor.fabric_type.trim())
      errors.fabric_type = "Fabric type is required";
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
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      <Box display="flex">
        <SideMenu />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Paper
            elevation={3}
            sx={{ p: 3, backgroundColor: "#0A1929", color: "white" }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography variant="h4" fontWeight="bold">
                Color Management
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenDialog}
              >
                Add New Color
              </Button>
            </Box>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <ColorTable
                colors={colors}
                onDelete={handleDelete}
                onEditRow={handleRowEditCommit}
              />
            )}
          </Paper>
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
                    label={field
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                    name={field}
                    value={newColor[field as keyof typeof newColor]}
                    onChange={handleInputChange}
                    error={!!formErrors[field as keyof typeof formErrors]}
                    helperText={formErrors[field as keyof typeof formErrors]}
                    InputLabelProps={{
                      sx: { color: "rgba(255, 255, 255, 0.7)" },
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "rgba(255, 255, 255, 0.23)",
                        },
                        "&:hover fieldset": {
                          borderColor: "rgba(255, 255, 255, 0.5)",
                        },
                        "&.Mui-focused fieldset": { borderColor: "#1976d2" },
                      },
                      "& .MuiInputBase-input": { color: "white" },
                    }}
                  />
                ))}
                {newColor.color_code && newColor.color_code.startsWith("#") && (
                  <Box
                    sx={{
                      mt: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
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
            <Alert
              onClose={handleCloseSnackbar}
              severity={snackbar.severity as any}
              sx={{ width: "100%" }}
            >
              {alertMessage}
            </Alert>
          </Snackbar>
        </Container>
      </Box>
    </AppTheme>
  );
};

export default ColorCatalogue;
