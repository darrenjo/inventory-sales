import express from "express";
import { authenticateToken, authorizeRole } from "../middleware/auth.js";
import {
  getCustomerById,
  addCustomer,
} from "../controllers/customerController.js";

const router = express.Router();

router.post(
  "/",
  authenticateToken,
  authorizeRole(["sales_staff", "superadmin"]),
  addCustomer
);

router.get(
  "/:customerId",
  authenticateToken,
  authorizeRole(["sales_staff", "superadmin"]),
  getCustomerById
);

export default router;
