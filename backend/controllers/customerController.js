import sequelize from "../config/database.js";
import { QueryTypes } from "sequelize";
import { Customer } from "../models/index.js";
import logger from "../utils/logger.js";
import validator from "validator";

// ✅ Get customer by ID
export const getCustomerById = async (req, res) => {
  try {
    const customerId = req.params.customerId;
    const user = req.user;

    logger.info(`Request to fetch customer with ID: ${customerId}`, {
      userId: user?.id,
      username: user?.username,
      customerId: customerId,
    });

    const customer = await Customer.findByPk(customerId);
    if (!customer) {
      logger.warn(`Customer not found: ${customerId}`, {
        userId: user?.id,
        requestedId: customerId,
      });
      return res.status(404).json({ error: "Customer not found" });
    }

    logger.info(
      `Successfully retrieved customer: ${customer.name} (ID: ${customerId})`,
      {
        userId: user?.id,
        customerId: customerId,
      }
    );

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
    logger.error(`Error fetching customer: ${error.message}`, {
      stack: error.stack,
      customerId: req.params.customerId,
      userId: req.user?.id,
    });
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Add new customer
export const addCustomer = async (req, res) => {
  try {
    const { name, phone, email } = req.body;
    const user = req.user;

    logger.info(`Customer creation attempt: ${name} (${phone})`, {
      userId: user?.id,
      username: user?.username,
      customerData: { name, phone, email },
    });

    if (!name || !phone) {
      logger.warn(`Customer creation failed: Missing required fields`, {
        userId: user?.id,
        provided: {
          name: !!name,
          phone: !!phone,
        },
      });
      return res.status(400).json({ error: "Name and phone are required" });
    }

    // Validasi phone number (harus angka dan panjang minimal 10)
    if (!validator.isMobilePhone(phone, ["id-ID"])) {
      logger.warn(`Customer creation failed: Invalid phone format: ${phone}`, {
        userId: user?.id,
        invalidPhone: phone,
      });
      return res.status(400).json({ error: "Invalid phone number format" });
    }

    // Validasi email jika ada
    if (email && !validator.isEmail(email)) {
      logger.warn(`Customer creation failed: Invalid email format: ${email}`, {
        userId: user?.id,
        invalidEmail: email,
      });
      return res.status(400).json({ error: "Invalid email format" });
    }

    const existingName = await Customer.findOne({
      where: sequelize.where(
        sequelize.fn("LOWER", sequelize.col("name")),
        name.toLowerCase()
      ),
    });
    if (existingName) {
      logger.warn(`Customer creation failed: Name already exists: ${name}`, {
        userId: user?.id,
        existingCustomerId: existingName.id,
      });
      return res.status(400).json({ error: "Customer name already exists" });
    }

    const existingCustomer = await Customer.findOne({ where: { phone } });
    if (existingCustomer) {
      logger.warn(`Customer creation failed: Phone already exists: ${phone}`, {
        userId: user?.id,
        existingCustomerId: existingCustomer.id,
      });
      return res.status(400).json({ error: "Phone number already exists" });
    }

    const newCustomer = await Customer.create({
      name,
      phone,
      email,
    });

    logger.info(
      `Customer created successfully: ${name} (ID: ${newCustomer.id})`,
      {
        userId: user?.id,
        username: user?.username,
        customerId: newCustomer.id,
        customerDetails: { name, phone, email },
      }
    );

    res
      .status(201)
      .json({ message: "Customer added successfully", newCustomer });
  } catch (error) {
    logger.error(`Error creating customer: ${error.message}`, {
      stack: error.stack,
      requestBody: req.body,
      userId: req.user?.id,
    });
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Get customer loyalty statistics
export const getCustomerLoyaltyStats = async (req, res) => {
  try {
    const user = req.user;

    logger.info(`Request to fetch customer loyalty statistics`, {
      userId: user?.id,
      username: user?.username,
    });

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

    logger.info(
      `Successfully fetched loyalty statistics for ${stats.length} customers`,
      {
        userId: user?.id,
        resultCount: stats.length,
      }
    );

    res.json({
      message: "Customer loyalty statistics fetched successfully",
      data: stats,
    });
  } catch (error) {
    logger.error(`Error fetching customer loyalty stats: ${error.message}`, {
      stack: error.stack,
      userId: req.user?.id,
    });
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Update customer
export const updateCustomer = async (req, res) => {
  try {
    const customerId = req.params.customerId;
    const { name, phone, email } = req.body;
    const user = req.user;

    logger.info(`Customer update attempt for ID: ${customerId}`, {
      userId: user?.id,
      username: user?.username,
      customerId: customerId,
      updateData: { name, phone, email },
    });

    const customer = await Customer.findByPk(customerId);
    if (!customer) {
      logger.warn(
        `Customer update failed: Customer not found (ID: ${customerId})`,
        {
          userId: user?.id,
          requestedId: customerId,
        }
      );
      return res.status(404).json({ error: "Customer not found" });
    }

    const updates = {};

    if (name !== undefined) updates.name = name;
    if (phone !== undefined) {
      if (!validator.isMobilePhone(phone, ["id-ID"])) {
        logger.warn(`Customer update failed: Invalid phone format: ${phone}`, {
          userId: user?.id,
          customerId: customerId,
          invalidPhone: phone,
        });
        return res.status(400).json({ error: "Invalid phone number format" });
      }
      updates.phone = phone;
    }
    if (email !== undefined) {
      if (email && !validator.isEmail(email)) {
        logger.warn(`Customer update failed: Invalid email format: ${email}`, {
          userId: user?.id,
          customerId: customerId,
          invalidEmail: email,
        });
        return res.status(400).json({ error: "Invalid email format" });
      }
      updates.email = email;
    }

    const oldValues = {
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
    };

    await customer.update(updates);

    logger.info(
      `Customer updated successfully: ${customer.name} (ID: ${customerId})`,
      {
        userId: user?.id,
        username: user?.username,
        customerId: customerId,
        changes: {
          from: oldValues,
          to: updates,
        },
      }
    );

    res.json({
      message: "Customer updated successfully",
      customer,
    });
  } catch (error) {
    logger.error(`Error updating customer: ${error.message}`, {
      stack: error.stack,
      customerId: req.params.customerId,
      requestBody: req.body,
      userId: req.user?.id,
    });
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Delete customer
export const deleteCustomer = async (req, res) => {
  try {
    const customerId = req.params.customerId;
    const user = req.user;

    logger.info(`Customer deletion attempt for ID: ${customerId}`, {
      userId: user?.id,
      username: user?.username,
      customerId: customerId,
    });

    const customer = await Customer.findByPk(customerId);
    if (!customer) {
      logger.warn(
        `Customer deletion failed: Customer not found (ID: ${customerId})`,
        {
          userId: user?.id,
          requestedId: customerId,
        }
      );
      return res.status(404).json({ error: "Customer not found" });
    }

    const customerDetails = {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
    };

    await customer.destroy();

    logger.info(
      `Customer deleted successfully: ${customer.name} (ID: ${customerId})`,
      {
        userId: user?.id,
        username: user?.username,
        customerDetails: customerDetails,
      }
    );

    res.json({ message: "Customer deleted successfully" });
  } catch (error) {
    logger.error(`Error deleting customer: ${error.message}`, {
      stack: error.stack,
      customerId: req.params.customerId,
      userId: req.user?.id,
    });
    res.status(500).json({ error: "Internal Server Error" });
  }
};
