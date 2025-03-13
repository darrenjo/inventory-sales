import express from "express";
import { getColors, createColor } from "../controllers/colorController.js";
import { authenticateToken, authorizeRole } from "../middleware/auth.js";

const router = express.Router();
router.get(
  "/",
  authenticateToken,
  authorizeRole(["inventory_staff", "sales_staff", "superadmin"]),
  getColors
);
router.post(
  "/",
  authenticateToken,
  authorizeRole(["inventory_staff", "superadmin"]),
  createColor
);

export default router;
