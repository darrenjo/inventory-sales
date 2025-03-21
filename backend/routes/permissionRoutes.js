import express from "express";
import {
  getAllPermissions,
  createPermission,
  updatePermission,
  deletePermission,
  assignPermissionToRole,
  removePermissionFromRole,
} from "../controllers/permissionController.js";
import { authenticateToken } from "../middleware/auth.js";
import { authorizePermission } from "../middleware/authPermission.js";

const router = express.Router();

// CRUD Permission
router.get(
  "/",
  authenticateToken,
  authorizePermission("manage_roles"),
  getAllPermissions
);
router.post(
  "/",
  authenticateToken,
  authorizePermission("manage_roles"),
  createPermission
);
router.put(
  "/:id",
  authenticateToken,
  authorizePermission("manage_roles"),
  updatePermission
);
router.delete(
  "/:id",
  authenticateToken,
  authorizePermission("manage_roles"),
  deletePermission
);

router.post(
  "/:id/assign-permission",
  authenticateToken,
  authorizePermission("manage_roles"),
  assignPermissionToRole
);
router.post(
  "/:id/remove-permission",
  authenticateToken,
  authorizePermission("manage_roles"),
  removePermissionFromRole
);

export default router;
