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
import Customer from "../pages/Customers"; // adjust path as needed


const API_URL = import.meta.env.VITE_API_URL;

interface CustomerFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onCustomerAdded?: (customer: typeof Customer) => void | Promise<void>;
}

const CustomerFormDialog: React.FC<CustomerFormDialogProps> = ({
  open,
  onClose,
  onSuccess,
  onCustomerAdded,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axios.post(`${API_URL}/customers`, {
        name,
        email,
        phone,
      });
      const newCustomer = response.data;

      if (onCustomerAdded) {
        await onCustomerAdded(newCustomer); // Pass it to parent
      }
      onSuccess();
      await onCustomerAdded?.(newCustomer);
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
              sx={{
                "& .MuiInputLabel-root": {
                  transform: "translate(14px, 10px) scale(1)",
                },
                "& .MuiInputLabel-shrink": {
                  transform: "translate(5px, -18px) scale(0.75)",
                },
              }}
            />
            <TextField
              label="Customer Email"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={{
            "& .MuiInputLabel-root": {
              transform: "translate(14px, 10px) scale(1)",
            },
            "& .MuiInputLabel-shrink": {
              transform: "translate(5px, -18px) scale(0.75)",
            },
          }}
            />
            <TextField
              label="Customer Phone Number"
              variant="outlined"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
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
