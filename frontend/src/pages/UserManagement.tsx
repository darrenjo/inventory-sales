import React, { useEffect, useState } from "react";
import { Container, Typography, Divider, Snackbar, Alert } from "@mui/material";
import UserForm from "../components/UserForm";
import UserTable from "../components/UserTable";
import axios from "axios";

// Base User type
type User = {
  id: string;
  username: string;
  roleId: number;
  is_active: boolean;
};

// Extended type with displayable status
type UserWithStatus = User & {
  status: string;
};

const API_URL = import.meta.env.VITE_API_URL;

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserWithStatus[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchUsers = async () => {
    try {
      const response = await axios.get<User[]>(`${API_URL}/users`);
      const mappedUsers: UserWithStatus[] = response.data.map((user) => ({
        ...user,
        status: user.is_active ? "Active" : "Inactive",
      }));
      setUsers(mappedUsers);
    } catch (err) {
      console.error("❌ Failed to fetch users:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
  };

  const clearSelection = () => {
    setSelectedUser(null);
  };

  const handleSuccess = () => {
    fetchUsers();
  };

  const handleDeleteUser = async (id: string) => {
    const confirmed = confirm("Are you sure you want to delete this user?");
    if (!confirmed) return;

    try {
      await axios.delete(`${API_URL}/users/${id}`);
      setSnackbar({
        open: true,
        message: "User deleted successfully!",
        severity: "success",
      });
      fetchUsers();
    } catch (error) {
      console.error("❌ Failed to delete user:", error);
      setSnackbar({
        open: true,
        message: "Failed to delete user.",
        severity: "error",
      });
    }
  };

  return (
    <Container>
      <Typography variant="h4" sx={{mb: 2}}>
        User Management
      </Typography>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', mb: 3 }} />

      <UserForm
        selectedUser={selectedUser}
        onSuccess={handleSuccess}
        clearSelection={clearSelection}
      />

      <Divider sx={{ my: 4 }} />

      <UserTable
        users={users}
        onEdit={handleEdit}
        onDelete={handleDeleteUser}
      />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UserManagement;
