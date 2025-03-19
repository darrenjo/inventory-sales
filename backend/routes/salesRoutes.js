import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { authorizePermission } from "../middleware/authPermission.js";
import {
  getSalesProducts,
  createTransaction,
  processRefund,
  returnStock,
} from "../controllers/salesController.js";

const router = express.Router();

router.get(
  "/products",
  authenticateToken,
  authorizePermission("manage_sales"),
  getSalesProducts
);

router.post(
  "/transactions",
  authenticateToken,
  authorizePermission("manage_sales"),
  createTransaction
);

router.post(
  "/refund",
  authenticateToken,
  authorizePermission("manage_sales"),
  processRefund
);

router.post(
  "/return",
  authenticateToken,
  authorizePermission("manage_sales"),
  returnStock
);

export default router;
