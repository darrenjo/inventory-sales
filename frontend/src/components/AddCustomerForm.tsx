import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Stack,
  CircularProgress,
} from "@mui/material";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

interface CustomerFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CustomerFormDialog: React.FC<CustomerFormDialogProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post(`${API_URL}/customers`, {
        name,
        email,
        phone,
      });
      onSuccess();
      onClose(); 
    } catch (error) {
      console.error("Error adding customer:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Customer</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <Stack spacing={3} sx={{ my: 2 }}>
            <TextField
              label="New Customer Name"
              variant="outlined"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <TextField
              label="Customer Email"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              label="Customer Phone Number"
              variant="outlined"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
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
                "Add New Customer"
              )}
            </Button>
          </Stack>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerFormDialog;
