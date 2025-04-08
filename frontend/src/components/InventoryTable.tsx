import React from "react";
import { DataGrid, GridColDef, GridRowParams } from "@mui/x-data-grid";
import { Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

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
  Batches: Batch[]; // JSON response has uppercase "B"
}

interface InventoryTableProps {
  inventory?: InventoryItem[];
}

const InventoryTable: React.FC<InventoryTableProps> = ({ inventory = [] }) => {
  const navigate = useNavigate();

  const theme = useTheme(); // Access MUI theme

  const columns: GridColDef[] = [
    { field: "name", headerName: "Name", flex: 1, minWidth: 150 },
    { field: "category", headerName: "Category", flex: 1, minWidth: 150 },
    { field: "color_code", headerName: "Color Code", flex: 1, minWidth: 150 },
    {
      field: "totalQuantity",
      headerName: "Total Quantity",
      flex: 1,
      minWidth: 150,
      type: "number",
    },
  ];

  const rows = inventory.map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    color_code: item.color_code,
    totalQuantity: item.Batches.reduce((sum, batch) => sum + batch.quantity, 0),
    // Store the original item for passing to the details page
    originalItem: item,
  }));

  // Handle row click to navigate to product detail page
  const handleRowClick = (params: GridRowParams) => {
    // Find the original item from the rows array
    const clickedRow = rows.find((row) => row.id === params.id);
    if (clickedRow) {
      // Navigate to product-details page and pass the product data via state
      navigate(`/product-details`, {
        state: {
          product: clickedRow.originalItem,
        },
      });
    }
  };

  return (
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
        pageSizeOptions={[5, 10, 20]}
        initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
        disableColumnResize
        density="compact"
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
  );
};

export default InventoryTable;
