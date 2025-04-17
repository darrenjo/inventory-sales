import express from "express";
import {
  getColors,
  createColor,
  deleteColor,
  updateColor,
} from "../controllers/colorController.js";
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

router.patch(
  "/:color_code",
  authenticateToken,
  authorizePermission("manage_products"),
  updateColor
);
router.delete(
  "/:color_code",
  authenticateToken,
  authorizePermission("manage_products"),
  deleteColor
);

export default router;
