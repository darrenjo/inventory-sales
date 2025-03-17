import Customer from "../models/customer.js";
import logger from "../utils/logger.js"; // Pakai Winston untuk logging

// ✅ Controller: Ambil data pelanggan berdasarkan ID
export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.customerId);
    if (!customer) {
      logger.warn(`Customer not found: ${req.params.customerId}`);
      return res.status(404).json({ error: "Customer not found" });
    }

    res.json({
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      total_spent: customer.total_spent,
      membership_tier: customer.membership_tier,
      points: customer.points,
      last_transaction_at: customer.last_transaction_at,
    });
  } catch (error) {
    logger.error(`Error fetching customer: ${error.message}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Controller: Tambah pelanggan baru
export const addCustomer = async (req, res) => {
  try {
    const { name, phone, email } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ error: "Name and phone are required" });
    }

    const existingCustomer = await Customer.findOne({ where: { phone } });
    if (existingCustomer) {
      return res.status(400).json({ error: "Phone number already exists" });
    }

    const newCustomer = await Customer.create({
      name,
      phone,
      email,
    });

    logger.info(`New customer added: ${newCustomer.id}`);
    res
      .status(201)
      .json({ message: "Customer added successfully", newCustomer });
  } catch (error) {
    logger.error(`Error adding customer: ${error.message}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
