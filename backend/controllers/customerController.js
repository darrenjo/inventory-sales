import sequelize from "../config/database.js";
import { QueryTypes } from "sequelize";
import { Customer } from "../models/index.js";
import logger from "../utils/logger.js";
import validator from "validator";

// ✅ Get customer by ID
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

// ✅ Add new customer
export const addCustomer = async (req, res) => {
  try {
    const { name, phone, email } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: "Name and phone are required" });
    }

    // Validasi phone number (harus angka dan panjang minimal 10)
    if (!validator.isMobilePhone(phone, ["id-ID"])) {
      return res.status(400).json({ error: "Invalid phone number format" });
    }

    // Validasi email jika ada
    if (email && !validator.isEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const existingName = await Customer.findOne({
      where: sequelize.where(
        sequelize.fn("LOWER", sequelize.col("name")),
        name.toLowerCase()
      ),
    });
    if (existingName) {
      return res.status(400).json({ error: "Customer name already exists" });
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

export const getCustomerLoyaltyStats = async (req, res) => {
  try {
    const stats = await sequelize.query(
      `
      SELECT 
        c."id",
        c."name",
        c."total_spent",
        c."points",
        c."membership_tier",
        COALESCE(SUM(t."discount"), 0) AS total_discount_received
      FROM "Customers" c
      LEFT JOIN "transactions" t ON c."id" = t."customer_id"
      GROUP BY c."id", c."membership_tier"
      ORDER BY c."total_spent" DESC;
      `,
      { type: QueryTypes.SELECT }
    );

    res.json({
      message: "Customer loyalty statistics fetched successfully",
      data: stats,
    });
  } catch (error) {
    logger.error("❌ Error fetching customer loyalty stats: " + error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
