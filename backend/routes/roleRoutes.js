import express from "express";
import {
  getAllRoles,
  createRole,
  updateRole,
  deleteRole,
} from "../controllers/roleController.js";
import { authenticateToken } from "../middleware/auth.js";
import { authorizePermission } from "../middleware/authPermission.js";

const router = express.Router();

router.get(
  "/",
  authenticateToken,
  authorizePermission("manage_roles"),
  getAllRoles
);
router.post(
  "/",
  authenticateToken,
  authorizePermission("manage_roles"),
  createRole
);
router.put(
  "/:id",
  authenticateToken,
  authorizePermission("manage_roles"),
  updateRole
);
router.delete(
  "/:id",
  authenticateToken,
  authorizePermission("manage_roles"),
  deleteRole
);

export default router;
