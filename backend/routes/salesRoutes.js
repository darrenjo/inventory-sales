import express from "express";
import { authenticateToken, authorizeRole } from "../middleware/auth.js";
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
  authorizeRole(["sales_staff", "superadmin"]),
  getSalesProducts
);

router.post(
  "/transactions",
  authenticateToken,
  authorizeRole(["sales_staff", "superadmin"]),
  createTransaction
);

router.post(
  "/refund",
  authenticateToken,
  authorizeRole(["sales_staff", "superadmin"]),
  processRefund
);

router.post(
  "/return",
  authenticateToken,
  authorizeRole(["sales_staff", "superadmin"]),
  returnStock
);

export default router;
