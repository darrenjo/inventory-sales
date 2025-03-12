// routes/productRoutes.js
import express from "express";
import { authenticateToken, authorizeRole } from "../middleware/auth.js";
import {
  createProduct,
  getProducts,
  deleteProduct,
  addStock,
  reduceStock,
  getBatchesByProduct,
} from "../controllers/productController.js";

const router = express.Router();

router.post(
  "/",
  authenticateToken,
  authorizeRole(["inventory_staff", "superadmin"]),
  createProduct
);
router.get("/", authenticateToken, getProducts);
router.post(
  "/stock",
  authenticateToken,
  authorizeRole(["inventory_staff", "superadmin"]),
  addStock
);
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole(["inventory_staff", "superadmin"]),
  deleteProduct
);
router.post(
  "/stock",
  authenticateToken,
  authorizeRole(["inventory_staff", "superadmin"]),
  addStock
);
router.post(
  "/reduce-stock",
  authenticateToken,
  authorizeRole(["sales_staff", "superadmin"]),
  reduceStock
);
router.get("/:id/batches", authenticateToken, getBatchesByProduct);

export default router;
