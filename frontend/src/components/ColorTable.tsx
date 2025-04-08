// components/ColorTable.tsx
import React from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridRowId,
  GridRowModel,
  GridActionsCellItem,
} from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit"; // buat nanti kalau mau nambah tombol edit manual

export interface Color {
  id: string;
  color_code: string;
  fabric_type: string;
  color: string;
}

interface Props {
  colors: Color[];
  onDelete: (id: GridRowId) => void;
  onEditRow: (id: GridRowId, updatedFields: Partial<Color>) => void;
}

const ColorTable: React.FC<Props> = ({ colors, onDelete, onEditRow }) => {
  const columns: GridColDef[] = [
    {
      field: "color_code",
      headerName: "Color Code",
      flex: 1,
      editable: true,
    },
    {
      field: "fabric_type",
      headerName: "Fabric Type",
      flex: 1,
      editable: true,
    },
    {
      field: "color",
      headerName: "Color",
      flex: 1,
      editable: true,
    },
    {
      field: "preview",
      headerName: "Preview",
      flex: 0.5,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box
          sx={{
            width: 36,
            height: 36,
            border: "1px solid white",
            borderRadius: "4px",
            backgroundColor: params.row.color_code.startsWith("#")
              ? params.row.color_code
              : `#${params.row.color_code}`,
          }}
        />
      ),
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          icon={
            <EditIcon
              sx={{
                color: "#90caf9",
                transition: "transform 0.2s ease",
                "&:hover": {
                  color: "#42a5f5",
                  transform: "scale(1.2)",
                },
              }}
            />
          }
          label="Edit"
          onClick={() => {
            // Optional: Trigger editing programmatically if needed
            console.log("Edit clicked", params.id);
          }}
        />,
        <GridActionsCellItem
          icon={
            <DeleteIcon
              sx={{
                color: "#f48fb1",
                transition: "transform 0.2s ease",
                "&:hover": {
                  color: "#f06292",
                  transform: "scale(1.2)",
                },
              }}
            />
          }
          label="Delete"
          onClick={() => {
            if (window.confirm("Are you sure you want to delete this color?")) {
              onDelete(params.id);
            }
          }}
        />,
      ],
    },
  ];

  const rows = colors.map((item) => ({
    ...item,
    id: item.id || item.color_code,
  }));

  const handleProcessRowUpdate = (
    newRow: GridRowModel,
    oldRow: GridRowModel
  ) => {
    const updatedFields = {
      fabric_type: newRow.fabric_type,
      color_code: newRow.color_code,
      color: newRow.color,
    };
    onEditRow(newRow.id, updatedFields);
    return newRow;
  };

  const handleProcessRowUpdateError = (error: any) => {
    console.error("Error saving row:", error);
  };

  return (
    <Box
      sx={{
        height: 500,
        width: "100%",
        "& .MuiDataGrid-root": {
          backgroundColor: "#112D4E",
          color: "white",
        },
        "& .MuiDataGrid-columnHeaders": {
          backgroundColor: "#001E3C",
          color: "white",
          fontWeight: "bold",
        },
        "& .MuiDataGrid-cell": {
          color: "white",
        },
        "& .MuiDataGrid-row:hover": {
          backgroundColor: "#103559",
        },
        "& .MuiDataGrid-editInputCell": {
          color: "white",
          backgroundColor: "#1E3A5A",
        },
      }}
    >
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        processRowUpdate={handleProcessRowUpdate}
        onProcessRowUpdateError={handleProcessRowUpdateError}
        pageSizeOptions={[5, 10, 25]}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 10, page: 0 },
          },
        }}
        sx={{
          borderColor: "rgba(255, 255, 255, 0.2)",
          "& .MuiDataGrid-cell:focus": {
            outline: "none",
          },
          "& .MuiDataGrid-iconSeparator": {
            display: "none",
          },
        }}
      />
    </Box>
  );
};

export default ColorTable;
