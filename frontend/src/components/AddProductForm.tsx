import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  MenuItem,
  Stack,
  CircularProgress,
} from "@mui/material";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

interface AddProductFormProps {
  onSuccess: () => void;
}

const AddProductForm: React.FC<AddProductFormProps> = ({ onSuccess }) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [colorCode, setColorCode] = useState("");
  const [colorOptions, setColorOptions] = useState<
    { color_code: string; color: string; fabric_type: string }[]
  >([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchColorCodes = async () => {
      try {
        const response = await axios.get(`${API_URL}/colors`);
        setColorOptions(response.data);
      } catch (error) {
        console.error("Error fetching color codes:", error);
      }
    };
    fetchColorCodes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post(`${API_URL}/products`, {
        name,
        category,
        color_code: colorCode,
      });
      onSuccess();
    } catch (error) {
      console.error("Error creating product:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={3} sx={{ my: 2 }}>
        <TextField
          label="Nama Produk"
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <TextField
          label="Kategori"
          variant="outlined"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        />

        <TextField
          select
          label="Kode Warna"
          value={colorCode}
          onChange={(e) => setColorCode(e.target.value)}
          required
        >
          {colorOptions.map((color) => (
            <MenuItem key={color.color_code} value={color.color_code}>
              {color.color_code} - {color.color} ({color.fabric_type})
            </MenuItem>
          ))}
        </TextField>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Simpan Produk"
          )}
        </Button>
      </Stack>
    </form>
  );
};

export default AddProductForm;
