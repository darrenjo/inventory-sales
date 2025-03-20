import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { authorizePermission } from "../middleware/authPermission.js";
import {
  getSalesProducts,
  createTransaction,
  processRefund,
  returnStock,
  getSalesSummary,
  getSalesByCategory,
  getSalesByStaff,
} from "../controllers/salesController.js";
import { getCustomerLoyaltyStats } from "../controllers/customerController.js";

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

router.get("/summary", authenticateToken, getSalesSummary);

router.get("/category-summary", authenticateToken, getSalesByCategory);
router.get("/sales-by-staff", authenticateToken, getSalesByStaff);
router.get(
  "/customer-loyalty-stats",
  authenticateToken,
  getCustomerLoyaltyStats
);

export default router;
