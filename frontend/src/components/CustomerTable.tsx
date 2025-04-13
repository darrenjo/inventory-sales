/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
} from "@mui/x-data-grid";
import {
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogActions,
  Button,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";

interface Customer {
  id: string;
  name: string;
  total_spent: number;
  points: number;
  membership_tier: string;
  total_discount_received: number;
}

interface Props {
  customers: Customer[];
  onDeleteSuccess?: () => void;
}

// const API_URL = import.meta.env.VITE_API_URL;

const CustomerTable: React.FC<Props> = ({ customers, onDeleteSuccess }) => {
//   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
//   const [selectedId, setSelectedId] = useState<string | null>(null);

//   const handleOpenDeleteDialog = (id: string) => {
//     setSelectedId(id);
//     setDeleteDialogOpen(true);
//   };

//   const handleDelete = async () => {
//     try {
//       await axios.delete(`${API_URL}/sales/customer/${selectedId}`);
//       if (onDeleteSuccess) onDeleteSuccess();
//     } catch (err) {
//       console.error("Failed to delete customer", err);
//     } finally {
//       setDeleteDialogOpen(false);
//     }
//   };

  const columns: GridColDef[] = [
    { field: "name", headerName: "Customer Name", flex: 1 },
    { field: "total_spent", headerName: "Total Spent", flex: 1, type: "number" },
    { field: "points", headerName: "Points", flex: 1, type: "number" },
    { field: "membership_tier", headerName: "Membership Tier", flex: 1 },
    { field: "total_discount_received", headerName: "Total Discount", flex: 1, type: "number" },
    
    //ini kalo mau ada delete cust di uncommand aj
    // {
    //   field: "actions",
    //   headerName: "Actions",
    //   flex: 0.5,
    //   sortable: false,
    //   filterable: false,
    //   renderCell: (params: GridRenderCellParams) => (
    //     <Tooltip title="Delete Customer">
    //       <IconButton onClick={() => handleOpenDeleteDialog(params.row.id)} color="error">
    //         <DeleteIcon />
    //       </IconButton>
    //     </Tooltip>
    //   ),
    // },
  ];

  return (
    <>
      <div style={{ height: 500, width: "100%" }}>
        <DataGrid rows={customers} columns={columns} getRowId={(row) => row.id} />
      </div>

      {/* <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog> */}
    </>
  );
};

export default CustomerTable;
