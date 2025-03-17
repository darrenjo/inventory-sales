import express from "express";
import {
  getCustomerById,
  addCustomer,
} from "../controllers/customerController.js";

const router = express.Router();

// ✅ Endpoint untuk ADD member baru
router.post("/", addCustomer);

// ✅ Endpoint untuk GET pelanggan berdasarkan ID
router.get("/:customerId", getCustomerById);

export default router;
