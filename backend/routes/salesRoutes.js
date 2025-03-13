import express from "express";
import { authenticateToken, authorizeRole } from "../middleware/auth.js";
import {
  getSalesProducts,
  createTransaction,
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

export default router;
