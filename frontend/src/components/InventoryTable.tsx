import React from "react";
import { DataGrid, GridColDef, GridRowParams } from "@mui/x-data-grid";
import {
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";

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

interface InventoryTableProps {
  inventory?: InventoryItem[];
  onProductDeleted?: () => void; // Callback for parent to refresh data
}

const API_URL = import.meta.env.VITE_API_URL;

const InventoryTable: React.FC<InventoryTableProps> = ({
  inventory = [],
  onProductDeleted,
}) => {
  const navigate = useNavigate();
  const theme = useTheme();

  const [selectedProductId, setSelectedProductId] = React.useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const handleDelete = async () => {
    if (!selectedProductId) return;

    try {
      await axios.delete(`${API_URL}/products/${selectedProductId}`);
      setDeleteDialogOpen(false);
      if (onProductDeleted) onProductDeleted();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleOpenDeleteDialog = (id: string) => {
    setSelectedProductId(id);
    setDeleteDialogOpen(true);
  };

  const columns: GridColDef[] = [
    { field: "name", headerName: "Product Name", flex: 1, minWidth: 150 },
    { field: "category", headerName: "Category", flex: 1, minWidth: 150 },
    { field: "color_code", headerName: "Color Code", flex: 1, minWidth: 150 },
    {
      field: "totalQuantity",
      headerName: "Total Quantity",
      flex: 1,
      minWidth: 150,
      type: "number",
    },
    {
      field: "actions",
      headerName: "Actions",
      minWidth: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Tooltip title="Delete Product">
          <IconButton
            color="error"
            onClick={(e) => {
              e.stopPropagation(); 
              handleOpenDeleteDialog(params.row.id);
            }}
          >
            <DeleteIcon sx={{
                color: "#f48fb1",
                transition: "transform 0.2s ease",
                "&:hover": {
                  color: "#f06292",
                  transform: "scale(1.2)",
                },
              }}/>
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  const rows = inventory.map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    color_code: item.color_code,
    totalQuantity: item.Batches.reduce((sum, batch) => sum + batch.quantity, 0),
    originalItem: item,
  }));

  const handleRowClick = (params: GridRowParams) => {
    const clickedRow = rows.find((row) => row.id === params.id);
    if (clickedRow) {
      navigate(`/product-details`, {
        state: {
          product: clickedRow.originalItem,
        },
      });
    }
  };

  return (
    <>
      <Paper
        sx={{
          height: 400,
          width: "100%",
          mt: 3,
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          // pageSizeOptions={[5, 10, 20]}
          initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
          onRowClick={handleRowClick}
          sx={{
            color: "white",
            backgroundColor: "#112D4E",
            "& .MuiDataGrid-cell": { color: "white" },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#001E3C",
              color: "white",
              fontWeight: "bold",
            },
            "& .MuiDataGrid-row:hover": { backgroundColor: "#103559" },
          }}
        />
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Product</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this product? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default InventoryTable;
