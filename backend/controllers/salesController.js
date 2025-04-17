import logger from "../utils/logger.js";
import { Op, fn, col, QueryTypes } from "sequelize";
import sequelize from "../config/database.js";
import { reduceStockFIFO } from "../utils/reduceStockFIFO.js";
import { generateBatchId } from "../utils/generateBatchId.js";
import { calculateDiscountAndPoints } from "../utils/transactionUtils.js";
import crypto from "crypto";
import {
  Product,
  Batch,
  TransactionDetail,
  Transaction,
  StockHistory,
  Refund,
  Return,
  Customer,
  LoyaltyHistory,
  User,
} from "../models/index.js";

// ✅ get sales products
export const getSalesProducts = async (req, res) => {
  try {
    const user = req.user;

    logger.info(`Request to fetch products for sales`, {
      userId: user?.id,
      username: user?.username,
    });

    const products = await Product.findAll({
      attributes: [
        "id",
        "name",
        "category",
        "color_code",
        [fn("COALESCE", fn("SUM", col("Batches.quantity")), 0), "total_stock"],
      ],
      include: [
        {
          model: Batch,
          attributes: [],
          where: { quantity: { [Op.gt]: 0 } }, // Only get batches with stock > 0
          required: false,
        },
      ],
      group: [
        "Product.id",
        "Product.name",
        "Product.category",
        "Product.color_code",
      ],
      order: [["name", "ASC"]],
    });

    logger.info(`Successfully fetched ${products.length} products for sales`, {
      userId: user?.id,
      count: products.length,
    });

    res.json(products);
  } catch (error) {
    logger.error(`Error fetching sales products: ${error.message}`, {
      stack: error.stack,
      userId: req.user?.id,
    });
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ get transactions
export const getTransaction = async (req, res) => {
  try {
    const user = req.user;

    logger.info(`Request to fetch all transactions`, {
      userId: user?.id,
      username: user?.username,
    });

    const transactions = await Transaction.findAll({
      include: [
        {
          model: User,
          as: "sales_staff",
          attributes: ["id", "username"],
        },
        {
          model: Customer,
          as: "customer",
          attributes: ["id", "name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    logger.info(`Successfully fetched ${transactions.length} transactions`, {
      userId: user?.id,
      count: transactions.length,
    });

    res.json(transactions);
  } catch (error) {
    logger.error(`Error fetching transactions: ${error.message}`, {
      stack: error.stack,
      userId: req.user?.id,
    });
    res.status(500).json({ message: "Failed to get transactions." });
  }
};

// ✅ get transaction details by ID
export const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    logger.info(`Request to fetch transaction with ID: ${id}`, {
      userId: user?.id,
      username: user?.username,
      transactionId: id,
    });

    const transaction = await Transaction.findByPk(id, {
      include: [
        {
          model: User,
          as: "sales_staff",
          attributes: ["id", "username"],
        },
        {
          model: Customer,
          as: "customer",
          attributes: ["id", "name"],
        },
        {
          model: TransactionDetail,
          attributes: ["id", "quantity", "sell_price_at_time", "createdAt"],
          include: [
            {
              model: Product,
              attributes: [
                "id",
                "name",
                "category",
                "color_code",
                "sell_price",
              ],
            },
          ],
        },
      ],
    });

    if (!transaction) {
      logger.warn(`Transaction not found: ${id}`, {
        userId: user?.id,
        requestedId: id,
      });
      return res.status(404).json({ message: "Transaction not found" });
    }

    logger.info(`Successfully fetched transaction: ${id}`, {
      userId: user?.id,
      transactionId: id,
      items: transaction.TransactionDetails?.length || 0,
      totalPrice: transaction.total_price,
    });

    res.json(transaction);
  } catch (error) {
    logger.error(`Error fetching transaction by ID: ${error.message}`, {
      stack: error.stack,
      transactionId: req.params.id,
      userId: req.user?.id,
    });
    res.status(500).json({ message: "Failed to get transaction details." });
  }
};

// ✅ create transaction
export const createTransaction = async (req, res) => {
  const { sales, customer_id } = req.body; // sales: [{ product_id, quantity }]
  const salesStaffId = req.user.id;
  const user = req.user;

  logger.info(`Transaction creation attempt by ${user.username}`, {
    userId: user.id,
    username: user.username,
    customerId: customer_id,
    items: sales?.length || 0,
  });

  if (!sales || sales.length === 0) {
    logger.warn(`Transaction failed: Sales data is required`, {
      userId: user.id,
      username: user.username,
      requestBody: req.body,
    });
    return res.status(400).json({ error: "Sales data is required" });
  }

  const dbTransaction = await sequelize.transaction();
  try {
    let totalPrice = 0;

    const transactionId = crypto.randomUUID(); // Generate UUID for transaction
    logger.info(`Transaction started with ID: ${transactionId}`, {
      userId: user.id,
      username: user.username,
      transactionId: transactionId,
    });

    // 1. Check if customer exists in system (Optional)
    let customer = null;
    if (customer_id) {
      customer = await Customer.findByPk(customer_id);
      if (!customer) {
        logger.warn(`Transaction failed: Customer not found`, {
          userId: user.id,
          customerId: customer_id,
        });
        await dbTransaction.rollback();
        return res
          .status(400)
          .json({ error: `Customer with ID ${customer_id} not found` });
      }

      logger.info(`Customer found: ${customer.name} (ID: ${customer.id})`, {
        userId: user.id,
        customerId: customer.id,
        customerName: customer.name,
      });
    }

    // 2. Get customer total spending before transaction
    const totalSpentBefore = customer ? customer.total_spent || 0 : 0;

    // 3. Save main transaction with temporary price
    await Transaction.create(
      {
        id: transactionId,
        customer_id: customer ? customer.id : null,
        sales_staff_id: salesStaffId,
        total_price: 0, // Temporary price
        discount: 0,
        points_earned: 0,
      },
      { transaction: dbTransaction }
    );

    // Process each product in the sale
    for (const item of sales) {
      const { product_id, quantity } = item;

      if (!product_id || !quantity || quantity <= 0) {
        logger.warn(`Transaction failed: Invalid product data`, {
          userId: user.id,
          productId: product_id,
          quantity: quantity,
        });
        throw new Error("Invalid product data in sales");
      }

      logger.info(`Processing product: ${product_id}, Quantity: ${quantity}`, {
        userId: user.id,
        transactionId: transactionId,
        productId: product_id,
        quantity: quantity,
      });

      // Get product sell price
      const product = await Product.findByPk(product_id);
      if (!product) {
        logger.warn(`Transaction failed: Product not found`, {
          userId: user.id,
          productId: product_id,
        });
        throw new Error(`Product with ID ${product_id} not found`);
      }

      const sellPriceAtTime = product.sell_price;
      totalPrice += sellPriceAtTime * quantity;

      // Reduce stock according to FIFO
      const stockUsage = await reduceStockFIFO(
        product_id,
        quantity,
        dbTransaction,
        salesStaffId
      );

      if (!Array.isArray(stockUsage) || stockUsage.length === 0) {
        logger.warn(`Transaction failed: Stock reduction failed`, {
          userId: user.id,
          productId: product_id,
          quantity: quantity,
        });
        throw new Error(`Stock reduction failed for product ID ${product_id}`);
      }

      // 4. Save transaction details
      await TransactionDetail.create(
        {
          id: crypto.randomUUID(),
          transaction_id: transactionId,
          product_id,
          quantity,
          sell_price_at_time: sellPriceAtTime,
          batch_id: stockUsage[0].batch_id,
        },
        { transaction: dbTransaction }
      );

      // 5. Record in StockHistory
      for (const batch of stockUsage) {
        await StockHistory.create(
          {
            batch_id: batch.batch_id,
            product_id,
            price_per_unit: batch.price,
            quantity: -batch.used_quantity,
            createdAt: new Date(),
            by_who: salesStaffId,
          },
          { transaction: dbTransaction }
        );

        logger.debug(
          `Stock reduced: Batch ${batch.batch_id}, Quantity: ${batch.used_quantity}`,
          {
            userId: user.id,
            batchId: batch.batch_id,
            productId: product_id,
            quantity: batch.used_quantity,
          }
        );
      }
    }

    let membership = { level: "Regular", discount: 0 };
    let discount = 0;
    let finalPrice = totalPrice;
    let pointsEarned = 0;

    // 6. Calculate discount and points only if customer exists
    if (customer) {
      ({ membership, discount, finalPrice, pointsEarned } =
        calculateDiscountAndPoints(totalPrice, totalSpentBefore));

      logger.info(`Applied loyalty discount for customer: ${customer.name}`, {
        userId: user.id,
        customerId: customer.id,
        membershipLevel: membership.level,
        discountPercentage: membership.discount * 100,
        discountAmount: discount,
        pointsEarned: pointsEarned,
      });
    }

    // Update transaction with final price details
    await Transaction.update(
      { total_price: totalPrice, discount, points_earned: pointsEarned },
      { where: { id: transactionId }, transaction: dbTransaction }
    );

    // Update customer data if applicable
    if (customer) {
      await Customer.update(
        {
          total_spent: totalSpentBefore + totalPrice,
          last_transaction_at: new Date(),
          points: sequelize.literal(`points + ${pointsEarned}`),
        },
        { where: { id: customer_id }, transaction: dbTransaction }
      );

      // 7. Save customer loyalty point history
      const latestPoints = await LoyaltyHistory.findOne({
        where: { customer_id },
        order: [["createdAt", "DESC"]],
        transaction: dbTransaction,
      });

      const totalPointsAfter = latestPoints
        ? latestPoints.total_points_after + pointsEarned
        : pointsEarned;

      await LoyaltyHistory.create(
        {
          id: crypto.randomUUID(),
          customer_id,
          transaction_id: transactionId,
          points_added: pointsEarned,
          total_points_after: totalPointsAfter,
          createdAt: new Date(),
        },
        { transaction: dbTransaction }
      );

      logger.info(`Customer loyalty updated: ${customer.name}`, {
        userId: user.id,
        customerId: customer.id,
        newTotalSpent: totalSpentBefore + totalPrice,
        newPoints: totalPointsAfter,
        pointsEarned: pointsEarned,
      });
    }

    await dbTransaction.commit();

    logger.info(`Transaction completed successfully: ${transactionId}`, {
      userId: user.id,
      username: user.username,
      transactionId: transactionId,
      itemCount: sales.length,
      totalPrice: totalPrice,
      discount: discount,
      finalPrice: finalPrice,
      pointsEarned: pointsEarned,
      customerId: customer?.id,
    });

    res.json({
      message: "Transaction completed successfully",
      transactionId,
      total_price: totalPrice,
      discount,
      final_price: finalPrice,
      points_earned: pointsEarned,
    });
  } catch (error) {
    await dbTransaction.rollback();

    logger.error(`Transaction failed: ${error.message}`, {
      stack: error.stack,
      userId: user.id,
      username: user.username,
      requestBody: req.body,
    });

    res
      .status(500)
      .json({ error: `Error processing transaction: ${error.message}` });
  }
};

// ✅ Process REFUND (Return items & refund money)
export const processRefund = async (req, res) => {
  const { transaction_id, product_id, quantity } = req.body;
  const user = req.user;

  logger.info(`Refund attempt for transaction: ${transaction_id}`, {
    userId: user.id,
    username: user.username,
    transactionId: transaction_id,
    productId: product_id,
    quantity: quantity,
  });

  const dbTransaction = await sequelize.transaction();
  try {
    // Check original transaction
    const transactionDetail = await TransactionDetail.findOne({
      where: { transaction_id, product_id },
      transaction: dbTransaction,
    });

    if (!transactionDetail) {
      logger.warn(`Refund failed: Transaction detail not found`, {
        userId: user.id,
        transactionId: transaction_id,
        productId: product_id,
      });
      await dbTransaction.rollback();
      throw new Error("Transaction detail not found");
    }

    if (quantity > transactionDetail.quantity) {
      logger.warn(`Refund failed: Quantity exceeds original sale`, {
        userId: user.id,
        transactionId: transaction_id,
        productId: product_id,
        requestedQuantity: quantity,
        originalQuantity: transactionDetail.quantity,
      });
      await dbTransaction.rollback();
      throw new Error("Refund quantity exceeds original sale");
    }

    // Find original batch or create new batch
    let originalBatch = await Batch.findOne({
      where: { id: transactionDetail.batch_id },
      transaction: dbTransaction,
    });

    if (originalBatch) {
      // If batch still exists, add stock back
      originalBatch.quantity += quantity;
      await originalBatch.save({ transaction: dbTransaction });

      logger.info(`Stock returned to existing batch: ${originalBatch.id}`, {
        userId: user.id,
        batchId: originalBatch.id,
        productId: product_id,
        quantity: quantity,
        newBatchQuantity: originalBatch.quantity,
      });
    } else {
      // If batch is exhausted, create new batch with previous sell price
      const newBatchId = generateBatchId(product_id);
      await Batch.create(
        {
          id: newBatchId,
          product_id,
          price: transactionDetail.sell_price_at_time,
          quantity,
          by_who: user.id,
        },
        { transaction: dbTransaction }
      );

      logger.info(`Created new batch for returned stock: ${newBatchId}`, {
        userId: user.id,
        batchId: newBatchId,
        productId: product_id,
        quantity: quantity,
        price: transactionDetail.sell_price_at_time,
      });
    }

    // Update StockHistory
    await StockHistory.create(
      {
        batch_id: originalBatch
          ? originalBatch.id
          : generateBatchId(product_id),
        product_id,
        price_per_unit: transactionDetail.sell_price_at_time,
        quantity, // Positive because stock is returned
        by_who: user.id,
        createdAt: new Date(),
      },
      { transaction: dbTransaction }
    );

    if (quantity <= 0) {
      logger.warn(`Refund failed: Invalid refund quantity`, {
        userId: user.id,
        quantity: quantity,
      });
      await dbTransaction.rollback();
      throw new Error("Invalid refund quantity");
    }

    // Record money return
    const refundAmount = quantity * transactionDetail.sell_price_at_time;
    await Refund.create(
      {
        transaction_id,
        product_id,
        quantity,
        refund_amount: refundAmount,
        refunded_by: user.id,
        refunded_at: new Date(),
      },
      { transaction: dbTransaction }
    );

    await dbTransaction.commit();

    logger.info(
      `Refund processed successfully for transaction: ${transaction_id}`,
      {
        userId: user.id,
        username: user.username,
        transactionId: transaction_id,
        productId: product_id,
        quantity: quantity,
        refundAmount: refundAmount,
      }
    );

    res.json({
      message: "Refund processed successfully",
      transaction_id,
      product_id,
      quantity,
      refund_amount: refundAmount,
    });
  } catch (error) {
    await dbTransaction.rollback();

    logger.error(`Error processing refund: ${error.message}`, {
      stack: error.stack,
      userId: user.id,
      username: user.username,
      transactionId: transaction_id,
      productId: product_id,
      quantity: quantity,
    });

    res
      .status(500)
      .json({ error: `Error processing refund: ${error.message}` });
  }
};

// ✅ Process Returns (Return items to stock)
export const returnStock = async (req, res) => {
  const { transaction_id, product_id, quantity, reason } = req.body;
  const user = req.user;

  logger.info(`Return stock attempt for transaction: ${transaction_id}`, {
    userId: user.id,
    username: user.username,
    transactionId: transaction_id,
    productId: product_id,
    quantity: quantity,
    reason: reason,
  });

  const dbTransaction = await sequelize.transaction();
  try {
    // Check transaction & product
    const existingTransaction = await Transaction.findByPk(transaction_id);
    const product = await Product.findByPk(product_id);

    if (!existingTransaction || !product) {
      logger.warn(`Return failed: Transaction or Product not found`, {
        userId: user.id,
        transactionId: transaction_id,
        productId: product_id,
        transactionExists: !!existingTransaction,
        productExists: !!product,
      });
      await dbTransaction.rollback();
      return res
        .status(404)
        .json({ error: "Transaction or Product not found" });
    }

    // Find transaction details to identify original batch
    const transactionDetail = await TransactionDetail.findOne({
      where: { transaction_id, product_id },
      transaction: dbTransaction,
    });

    if (!transactionDetail) {
      logger.warn(`Return failed: Transaction detail not found`, {
        userId: user.id,
        transactionId: transaction_id,
        productId: product_id,
      });
      await dbTransaction.rollback();
      throw new Error(
        "Transaction detail not found, cannot determine batch_id"
      );
    }

    const originalBatch = await Batch.findOne({
      where: { id: transactionDetail.batch_id || null },
      transaction: dbTransaction,
    });

    if (!originalBatch) {
      logger.warn(
        `No original batch found for return: ${transactionDetail.batch_id}`,
        {
          userId: user.id,
          batchId: transactionDetail.batch_id,
        }
      );
    }

    // Get original batch price or transaction-time price
    const batchPrice =
      originalBatch?.price || transactionDetail.sell_price_at_time;

    if (!batchPrice) {
      logger.warn(`Return failed: Cannot determine price for batch creation`, {
        userId: user.id,
        transactionId: transaction_id,
        productId: product_id,
      });
      await dbTransaction.rollback();
      throw new Error("Price for batch creation cannot be determined");
    }

    // Generate new batch ID with "_RET" suffix
    const returnBatchId = originalBatch
      ? `${originalBatch.id}_RET`
      : `${product_id}_RET_${Date.now()}`;

    // Find existing return batch if any
    let returnBatch = await Batch.findOne({
      where: { product_id, status: "returned" },
      transaction: dbTransaction,
    });

    if (!returnBatch) {
      logger.info(`Creating new return batch: ${returnBatchId}`, {
        userId: user.id,
        productId: product_id,
        batchId: returnBatchId,
      });

      returnBatch = await Batch.create(
        {
          id: returnBatchId,
          product_id,
          price: batchPrice,
          quantity: 0,
          by_who: user.id,
          status: "returned",
        },
        { transaction: dbTransaction }
      );
    }

    // Add returned items to return batch
    returnBatch.quantity += quantity;
    await returnBatch.save({ transaction: dbTransaction });

    // Save return data
    const newReturn = await Return.create(
      {
        transaction_id,
        product_id,
        batch_id: returnBatch.id,
        quantity,
        reason,
        returned_by: user.id,
      },
      { transaction: dbTransaction }
    );

    // Save in StockHistory
    await StockHistory.create(
      {
        batch_id: returnBatch.id,
        product_id,
        price_per_unit: batchPrice,
        quantity,
        by_who: user.id,
      },
      { transaction: dbTransaction }
    );

    await dbTransaction.commit();

    logger.info(
      `Return processed successfully for transaction: ${transaction_id}`,
      {
        userId: user.id,
        username: user.username,
        transactionId: transaction_id,
        productId: product_id,
        productName: product.name,
        quantity: quantity,
        returnBatchId: returnBatch.id,
        reason: reason,
      }
    );

    res.status(201).json({
      message: "Return processed successfully",
      return: {
        id: newReturn.id,
        transaction_id,
        product_id,
        quantity,
        reason,
      },
    });
  } catch (error) {
    await dbTransaction.rollback();

    logger.error(`Error processing return: ${error.message}`, {
      stack: error.stack,
      userId: user.id,
      username: user.username,
      transactionId: transaction_id,
      productId: product_id,
      quantity: quantity,
    });

    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
};

// ✅ Get sales summary
export const getSalesSummary = async (req, res) => {
  try {
    const { range } = req.query;
    const user = req.user;

    logger.info(`Request for sales summary with range: ${range}`, {
      userId: user?.id,
      username: user?.username,
      range: range,
    });

    // Validate allowed ranges
    const allowedRanges = ["daily", "monthly", "yearly"];
    if (!allowedRanges.includes(range)) {
      logger.warn(`Invalid range parameter: ${range}`, {
        userId: user?.id,
        invalidRange: range,
        allowedRanges: allowedRanges,
      });
      return res.status(400).json({ error: "Invalid range parameter" });
    }

    // Map range to PostgreSQL DATE_TRUNC format
    const dateTruncFormat = {
      daily: "day",
      monthly: "month",
      yearly: "year",
    };

    const salesData = await sequelize.query(
      `
      SELECT DATE_TRUNC(:rangeType, "createdAt") AS date, SUM("total_price") AS total_sales
      FROM "transactions"
      GROUP BY date
      ORDER BY date;
      `,
      {
        type: QueryTypes.SELECT,
        replacements: { rangeType: dateTruncFormat[range] },
      }
    );

    logger.info(
      `Sales summary fetched successfully: ${salesData.length} records`,
      {
        userId: user?.id,
        range: range,
        recordCount: salesData.length,
      }
    );

    res.json({ range, data: salesData });
  } catch (error) {
    logger.error(`Error fetching sales summary: ${error.message}`, {
      stack: error.stack,
      range: req.query.range,
      userId: req.user?.id,
    });
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Get sales by category
export const getSalesByCategory = async (req, res) => {
  try {
    const { range } = req.query;
    const user = req.user;

    logger.info(`Request for sales by category with range: ${range}`, {
      userId: user?.id,
      username: user?.username,
      range: range,
    });

    const allowedRanges = ["daily", "monthly", "yearly"];
    const dateTruncFormat = {
      daily: "day",
      monthly: "month",
      yearly: "year",
    };

    // Default to monthly if no range specified
    const rangeType = allowedRanges.includes(range)
      ? dateTruncFormat[range]
      : "month";

    const salesData = await sequelize.query(
      `
      SELECT DATE_TRUNC(:rangeType, t."createdAt") AS date, 
             p."name" AS category, 
             SUM(td."sell_price_at_time" * td."quantity") AS total_sales
      FROM "transaction_details" td
      JOIN "Products" p ON td."product_id" = p."id"
      JOIN "transactions" t ON td."transaction_id" = t."id"
      GROUP BY date, p."name"
      ORDER BY date;
      `,
      {
        type: QueryTypes.SELECT,
        replacements: { rangeType },
      }
    );

    logger.info(
      `Sales by category fetched successfully: ${salesData.length} records`,
      {
        userId: user?.id,
        range: range || "monthly",
        recordCount: salesData.length,
      }
    );

    res.json({ range: range || "monthly", data: salesData });
  } catch (error) {
    logger.error(`Error fetching sales by category: ${error.message}`, {
      stack: error.stack,
      range: req.query.range,
      userId: req.user?.id,
    });
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Get sales by staff
export const getSalesByStaff = async (req, res) => {
  try {
    const { rangeType } = req.query; // day, week, month
    const user = req.user;

    logger.info(`Request for sales by staff with range: ${rangeType}`, {
      userId: user?.id,
      username: user?.username,
      range: rangeType,
    });

    const salesData = await sequelize.query(
      `
      SELECT DATE_TRUNC(:rangeType, t."createdAt") AS date, 
             u."username" AS sales_staff, 
             SUM(td."sell_price_at_time" * td."quantity") AS total_sales
      FROM "transaction_details" td
      JOIN "transactions" t ON td."transaction_id" = t."id"
      JOIN "Users" u ON t."sales_staff_id" = u."id"
      GROUP BY date, u."username"
      ORDER BY date;
      `,
      {
        type: QueryTypes.SELECT,
        replacements: { rangeType },
      }
    );

    logger.info(
      `Sales by staff fetched successfully: ${salesData.length} records`,
      {
        userId: user?.id,
        range: rangeType,
        recordCount: salesData.length,
      }
    );

    res.json({
      message: "Sales by staff fetched successfully",
      data: salesData,
    });
  } catch (error) {
    logger.error(`Error fetching sales by staff: ${error.message}`, {
      stack: error.stack,
      rangeType: req.query.rangeType,
      userId: req.user?.id,
    });
    res.status(500).json({ error: "Internal Server Error" });
  }
};
