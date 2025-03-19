import express from "express";
import { authenticateToken, authorizeRole } from "../middleware/auth.js";
import {
  getCustomerById,
  addCustomer,
} from "../controllers/customerController.js";
import { authorizePermission } from "../middleware/authPermission.js";

const router = express.Router();

router.post(
  "/",
  authenticateToken,
  authorizePermission("manage_customers"),
  addCustomer
);

router.get(
  "/:customerId",
  authenticateToken,
  authorizePermission("manage_customers"),
  getCustomerById
);

export default router;
