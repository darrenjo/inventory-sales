import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";

type Role = {
  id: number;
  name: string;
};

type User = {
  id: string;
  username: string;
  password?: string;
  roleId: number;
  is_active: boolean;
};

interface Props {
  selectedUser: User | null;
  onSuccess: () => void;
  clearSelection: () => void;
}

const API_URL = import.meta.env.VITE_API_URL;

const UserForm: React.FC<Props> = ({
  selectedUser,
  onSuccess,
  clearSelection,
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState<number | "">("");
  const [isActive, setIsActive] = useState(true);
  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await axios.get(`${API_URL}/roles`);
        setRoles(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch roles:", err);
      }
    };
    fetchRoles();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      setUsername(selectedUser.username);
      setRoleId(selectedUser.roleId);
      setIsActive(selectedUser.is_active);
    } else {
      setUsername("");
      setPassword("");
      setRoleId("");
      setIsActive(true);
    }
  }, [selectedUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedUser) {
        // PATCH
        await axios.patch(`${API_URL}/users/${selectedUser.id}`, {
          username,
          roleId,
          is_active: isActive,
        });
      } else {
        // POST
        await axios.post(`${API_URL}/users`, {
          username,
          password,
          roleId,
        });
      }

      onSuccess();
      clearSelection();
    } catch (err) {
      console.error("❌ Failed to save user:", err);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{mb: 3}}>
        {selectedUser ? "Edit User" : "Create User"}
      </Typography>

      <TextField
        label="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        fullWidth
        sx={{ 
          mb: 3, 
          "& .MuiInputLabel-root": {
              transform: "translate(14px, 10px) scale(1)",
          },
          "& .MuiInputLabel-shrink": {
              transform: "translate(5px, -18px) scale(0.75)",
          }, 
        }}
      />

      {!selectedUser && (
        <TextField
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          required
          fullWidth
          sx={{ 
            mb: 3, 
            "& .MuiInputLabel-root": {
                transform: "translate(14px, 10px) scale(1)",
            },
            "& .MuiInputLabel-shrink": {
                transform: "translate(5px, -18px) scale(0.75)",
            }, 
          }}
        />
      )}

      <FormControl fullWidth sx={{ mb: 2 }} required>
        <InputLabel
        >Role</InputLabel>
        <Select
          value={roleId}
          onChange={(e) => setRoleId(Number(e.target.value))}
          label="Role"
        >
          {roles.map((role) => (
            <MenuItem key={role.id} value={role.id}>
              {role.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedUser && (
        <FormControl sx={{ mb: 2 }}>
          <Typography>Status Aktif</Typography>
          <Switch
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
        </FormControl>
      )}

      <Box display="flex" gap={2}>
        <Button type="submit" variant="contained" color="primary">
          {selectedUser ? "Update" : "Create"}
        </Button>
        {selectedUser && (
          <Button variant="outlined" onClick={clearSelection}>
            Cancel
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default UserForm;
