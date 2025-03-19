import express from "express";
import { getColors, createColor } from "../controllers/colorController.js";
import { authenticateToken } from "../middleware/auth.js";
import { authorizePermission } from "../middleware/authPermission.js";

const router = express.Router();
router.get("/", authenticateToken, getColors);

router.post(
  "/",
  authenticateToken,
  authorizePermission("manage_products"),
  createColor
);

export default router;
