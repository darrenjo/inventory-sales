/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Divider,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  FormGroup,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { useSnackbar } from "notistack";

interface Role {
  id: number;
  name: string;
}

interface Permission {
  id: number;
  name: string;
}

const API_URL = import.meta.env.VITE_API_URL;

const RolePermission: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [rolePermissions, setRolePermissions] = useState<Set<number>>(
    new Set()
  );
  const [loading, setLoading] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [creatingRole, setCreatingRole] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchRolesAndPermissions = async () => {
      try {
        const [rolesRes, permissionsRes] = await Promise.all([
          axios.get(`${API_URL}/roles`),
          axios.get(`${API_URL}/permissions`),
        ]);

        setRoles(rolesRes.data);
        setPermissions(permissionsRes.data);

        // If a role is already selected, fetch its permissions
        if (selectedRoleId !== null) {
          fetchRolePermissions(selectedRoleId);
        }
      } catch (err) {
        enqueueSnackbar("Gagal ambil data role/permission", {
          variant: "error",
        });
      }
    };

    fetchRolesAndPermissions();
  }, [selectedRoleId]); // Update when selectedRoleId changes

  const fetchRolePermissions = async (roleId: number) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_URL}/permissions/roles/${roleId}/permissions`
      );
      const permissionIds = res.data.map((perm: Permission) => perm.id);
      setRolePermissions(new Set(permissionIds));
    } catch (err) {
      enqueueSnackbar("Gagal ambil permission untuk role ini", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const roleId = event.target.value as number;
    setSelectedRoleId(roleId);
  };

  const handlePermissionToggle = (permissionId: number) => {
    setRolePermissions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(permissionId)) {
        newSet.delete(permissionId);
      } else {
        newSet.add(permissionId);
      }
      return newSet;
    });
  };

  const handleSave = async () => {
    if (selectedRoleId === null) return;

    try {
      await axios.put(
        `${API_URL}/permissions/roles/${selectedRoleId}/permissions`,
        {
          permissionIds: Array.from(rolePermissions),
        }
      );
      enqueueSnackbar("Permission berhasil disimpan", { variant: "success" });
    } catch (err) {
      enqueueSnackbar("Gagal simpan permission", { variant: "error" });
    }
  };

  return (
    <>
      <Box mb={3} maxWidth={600}>
        <Typography variant="h6" gutterBottom>
          Add New Role
        </Typography>

        <Box display="flex" gap={2}>
          <input
            type="text"
            placeholder="Enter role name"
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
            style={{
              padding: "10px",
              flex: 1,
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
          <Button
            variant="contained"
            color="secondary"
            onClick={async () => {
              if (!newRoleName.trim()) {
                enqueueSnackbar("Role name is required", {
                  variant: "warning",
                });
                return;
              }

              setCreatingRole(true);
              try {
                const res = await axios.post(`${API_URL}/roles`, {
                  name: newRoleName.trim(),
                });

                enqueueSnackbar("Role created!", { variant: "success" });
                setRoles((prev) => [...prev, res.data]); // Update role list
                setSelectedRoleId(res.data.id); // Optionally auto-select
                setNewRoleName("");
              } catch (err: any) {
                enqueueSnackbar(
                  err?.response?.data?.error || "Gagal membuat role",
                  { variant: "error" }
                );
              } finally {
                setCreatingRole(false);
              }
            }}
            disabled={creatingRole}
          >
            {creatingRole ? "Saving..." : "Add Role"}
          </Button>
        </Box>

        <Typography variant="body2" color="textSecondary">
          Note: You must create a role before assigning permissions to it.
        </Typography>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.2)", my: 3 }} />
      </Box>

      <Box p={4}>
        <Typography variant="h5" gutterBottom>
          Set Permission per Role
        </Typography>
        <Divider sx={{ borderColor: "rgba(255,255,255,0.2)", mb: 3 }} />

        <Box mb={3} maxWidth={300}>
          <InputLabel id="role-select-label">Select Role</InputLabel>
          <Select
            labelId="role-select-label"
            value={selectedRoleId ?? ""}
            onChange={handleRoleChange}
            fullWidth
          >
            {roles.map((role) => (
              <MenuItem key={role.id} value={role.id}>
                {role.name}
              </MenuItem>
            ))}
          </Select>
        </Box>

        {loading ? (
          <CircularProgress />
        ) : (
          <FormGroup>
            {permissions.map((permission) => (
              <FormControlLabel
                key={permission.id}
                control={
                  <Checkbox
                    checked={rolePermissions.has(permission.id)}
                    onChange={() => handlePermissionToggle(permission.id)}
                    name={permission.name}
                  />
                }
                label={permission.name}
              />
            ))}
          </FormGroup>
        )}

        <Box mt={3}>
          <Button
            variant="contained"
            color="primary"
            disabled={selectedRoleId === null}
            onClick={handleSave}
            sx={{
              whiteSpace: "nowrap",
              py: 1.5,
              "&.Mui-disabled": {
                backgroundColor: "#132F4C",
                color: "grey",
              },
            }}
          >
            Save Permissions for Role
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default RolePermission;
