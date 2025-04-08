import React from "react";
import { Dialog, DialogTitle, DialogContent } from "@mui/material";
import AddProductForm from "../components/AddProductForm";

interface ProductFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ProductFormDialog: React.FC<ProductFormDialogProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Tambah Produk</DialogTitle>
      <DialogContent>
        <AddProductForm onSuccess={onSuccess} />
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormDialog;
