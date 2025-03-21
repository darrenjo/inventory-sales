import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { authorizePermission } from "../middleware/authPermission.js";
import {
  createProduct,
  getProducts,
  deleteProduct,
  addStock,
  reduceStock,
  getBatchesByProduct,
} from "../controllers/productController.js";

const router = express.Router();

// router.post(
//   "/",
//   authenticateToken,
//   authorizeRole(["inventory_staff", "superadmin"]),
//   createProduct
// );

router.post(
  "/",
  authenticateToken,
  authorizePermission("manage_products"),
  createProduct
);

router.get("/", authenticateToken, getProducts);

router.delete(
  "/:id",
  authenticateToken,
  authorizePermission("manage_stock"),
  deleteProduct
);

router.post(
  "/stock",
  authenticateToken,
  authorizePermission("manage_stock"),
  addStock
);

router.post(
  "/reduce-stock",
  authenticateToken,
  authorizePermission("manage_stock"),
  reduceStock
);

router.get("/:id/batches", authenticateToken, getBatchesByProduct);

export default router;
