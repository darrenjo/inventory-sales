import express from "express";
import { getUsers } from "../controllers/userController.js";
import { authenticateToken, authorizeRole } from "../middleware/auth.js";
import { authorizePermission } from "../middleware/authPermission.js";

const router = express.Router();
router.get(
  "/",
  authenticateToken,
  authorizePermission("manage_users"),
  getUsers
);

export default router;
