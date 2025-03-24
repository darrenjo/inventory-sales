import express from "express";
import { getUsers, profile } from "../controllers/userController.js";
import { authenticateToken, authorizeRole } from "../middleware/auth.js";
import { authorizePermission } from "../middleware/authPermission.js";

const router = express.Router();
router.get(
  "/",
  authenticateToken,
  authorizePermission("manage_users"),
  getUsers
);

router.get("/profile", authenticateToken, profile);

export default router;
