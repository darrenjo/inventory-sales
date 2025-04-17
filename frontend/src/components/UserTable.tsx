import React from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { IconButton, Stack } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

type User = {
  id: string;
  username: string;
  roleId: number;
  is_active: boolean;
  status: string;
};

type Props = {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
};

const UserTable: React.FC<Props> = ({ users, onEdit, onDelete }) => {
  const columns: GridColDef[] = [
    { field: "username", headerName: "Username", flex: 1 },
    { field: "roleId", headerName: "Role", flex: 1 },
    { field: "status", headerName: "Status", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <IconButton onClick={() => onEdit(params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton color="error" onClick={() => onDelete(params.row.id)}>
            <DeleteIcon />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <div style={{ height: 500, width: "100%" }}>
      <DataGrid
        rows={users}
        columns={columns}
        getRowId={(row) => row.id}
        disableRowSelectionOnClick
        autoHeight
        pageSizeOptions={[5, 10, 25]}
      />
    </div>
  );
};

export default UserTable;
