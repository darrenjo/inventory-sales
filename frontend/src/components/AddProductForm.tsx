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
  const [sellPrice, setSellPrice] = useState("");

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
        sell_price: parseInt(sellPrice),
      });
      onSuccess();
    } catch (error) {
      console.error("Error creating product:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <Stack spacing={3} sx={{ my: 2 }} className="w-full">
        <TextField
          label="Product Name"
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          fullWidth
          className="w-full text-white"
          InputProps={{
            className: "rounded-md bg-black border-blue-500 border text-white",
          }}
          InputLabelProps={{
            className: "text-blue-400",
          }}
          sx={{
            "& .MuiInputLabel-root": {
              transform: "translate(14px, 10px) scale(1)",
            },
            "& .MuiInputLabel-shrink": {
              transform: "translate(5px, -18px) scale(0.75)",
            },
            "& .MuiOutlinedInput-notchedOutline": {
              paddingTop: "8px",
            },
            "& legend": {
              height: "11px",
            },
          }}
        />

        <TextField
          select
          label="Category"
          variant="outlined"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          fullWidth
          className="w-full"
          sx={{
            "& .MuiInputLabel-root": {
              transform: "translate(14px, 10px) scale(1)",
            },
            "& .MuiInputLabel-shrink": {
              transform: "translate(5px, -18px) scale(0.75)",
            },
          }}
        >
          <MenuItem value="fabric">Fabric</MenuItem>
          <MenuItem value="kerah">Kerah</MenuItem>
          <MenuItem value="manset">Manset</MenuItem>
          <MenuItem value="others">Others</MenuItem>
        </TextField>

        <TextField
          select
          label="Color Code"
          value={colorCode}
          onChange={(e) => setColorCode(e.target.value)}
          required
          className="w-full"
          sx={{
            "& .MuiInputLabel-root": {
              transform: "translate(14px, 10px) scale(1)",
            },
            "& .MuiInputLabel-shrink": {
              transform: "translate(5px, -18px) scale(0.75)",
            },
          }}
        >
          {colorOptions.map((color) => (
            <MenuItem key={color.color_code} value={color.color_code}>
              {color.color_code} - {color.color} ({color.fabric_type})
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Sell Price"
          variant="outlined"
          value={sellPrice}
          onChange={(e) => setSellPrice(e.target.value)}
          type="number"
          required
          className="w-full"
          sx={{
            "& .MuiInputLabel-root": {
              transform: "translate(14px, 10px) scale(1)",
            },
            "& .MuiInputLabel-shrink": {
              transform: "translate(5px, -18px) scale(0.75)",
            },
          }}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Save New Product"
          )}
        </Button>
      </Stack>
    </form>
  );
};

export default AddProductForm;