import {
  Product,
  Batch,
  TransactionDetail,
  Transaction,
} from "../models/product.js";
import winston from "../utils/logger.js";
import { Op, fn, col, literal } from "sequelize";
import sequelize from "../config/database.js"; // Gunakan transaksi SQL untuk keamanan
import { reduceStockFIFO } from "../utils/reduceStockFIFO.js";
import StockHistory from "../models/stockHistory.js";
import logger from "../utils/logger.js";
import Refund from "../models/refund.js";
import Return from "../models/return.js";
import { generateBatchId } from "./productController.js";

export const getSalesProducts = async (req, res) => {
  try {
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
          attributes: [], // Tidak perlu memasukkan atribut Batch langsung
          where: { quantity: { [Op.gt]: 0 } }, // Hanya ambil batch dengan stok > 0
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

    res.json(products);
  } catch (error) {
    winston.error("Error fetching sales products:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const createTransaction = async (req, res) => {
  const { sales } = req.body; // sales: [{ product_id, quantity }]
  const salesStaffId = req.user.id; // Ambil ID Sales Staff dari token

  if (!sales || sales.length === 0) {
    logger.warn("Transaction failed: Sales data is required");
    return res.status(400).json({ error: "Sales data is required" });
  }

  const transaction = await sequelize.transaction();
  try {
    let totalPrice = 0;
    const transactionId = crypto.randomUUID(); // Generate UUID untuk transaksi

    logger.info(`Transaction started. ID: ${transactionId}`);

    // Simpan transaksi utama lebih awal
    await Transaction.create(
      {
        id: transactionId,
        sales_staff_id: salesStaffId,
        total_price: 0, // Nanti di-update setelah hitung total harga
      },
      { transaction }
    );

    for (const item of sales) {
      const { product_id, quantity } = item;

      if (!product_id || !quantity || quantity <= 0) {
        throw new Error("Invalid product data in sales");
      }

      logger.info(`Processing product: ${product_id}, Quantity: ${quantity}`);

      // Ambil harga jual produk
      const product = await Product.findByPk(product_id);
      if (!product) throw new Error(`Product with ID ${product_id} not found`);

      const sellPriceAtTime = product.sell_price;
      totalPrice += sellPriceAtTime * quantity;

      // Kurangi stok sesuai FIFO
      const stockUsage = await reduceStockFIFO(
        product_id,
        quantity,
        transaction,
        salesStaffId
      );

      if (!Array.isArray(stockUsage) || stockUsage.length === 0) {
        throw new Error(`Stock reduction failed for product ID ${product_id}`);
      }

      // Simpan detail transaksi
      await TransactionDetail.create(
        {
          id: crypto.randomUUID(),
          transaction_id: transactionId, // Sekarang sudah valid karena Transaction sudah dibuat
          product_id,
          quantity,
          sell_price_at_time: sellPriceAtTime,
          batch_id: stockUsage[0].batch_id, // Ambil batch pertama
        },
        { transaction }
      );

      // Catat di StockHistory per batch yang terpakai
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
          { transaction }
        );
      }
    }

    // Update total price transaksi setelah semua produk diproses
    await Transaction.update(
      { total_price: totalPrice },
      { where: { id: transactionId }, transaction }
    );

    await transaction.commit();
    logger.info(`Transaction committed successfully. ID: ${transactionId}`);
    res.json({ message: "Transaction completed successfully", transactionId });
  } catch (error) {
    await transaction.rollback();
    logger.error(`Transaction failed: ${error.message}`);
    res
      .status(500)
      .json({ error: `Error processing transaction: ${error.message}` });
  }
};

// Proses REFUND (Barang dikembalikan & uang dikembalikan)
export const processRefund = async (req, res) => {
  const { transaction_id, product_id, quantity } = req.body;
  const user = req.user;

  const transaction = await sequelize.transaction();
  try {
    // Cek transaksi asli
    const transactionDetail = await TransactionDetail.findOne({
      where: { transaction_id, product_id },
      transaction,
    });

    if (!transactionDetail) {
      throw new Error("Transaction detail not found");
    }

    if (quantity > transactionDetail.quantity) {
      throw new Error("Refund quantity exceeds original sale");
    }

    // Cari batch asli atau buat batch baru
    let originalBatch = await Batch.findOne({
      where: { id: transactionDetail.batch_id },
      transaction,
    });

    if (originalBatch) {
      // Jika batch masih ada, tambahkan stok kembali
      originalBatch.quantity += quantity;
      await originalBatch.save({ transaction });
    } else {
      // Jika batch sudah habis, buat batch baru dengan harga jual sebelumnya
      await Batch.create(
        {
          id: generateBatchId(product_id),
          product_id,
          price: transactionDetail.sell_price_at_time, // Harga jual saat transaksi
          quantity,
          by_who: user.id,
        },
        { transaction }
      );
    }

    // Update StockHistory
    await StockHistory.create(
      {
        batch_id: originalBatch
          ? originalBatch.id
          : generateBatchId(product_id),
        product_id,
        price_per_unit: transactionDetail.sell_price_at_time,
        quantity, // Positif karena barang masuk kembali
        by_who: user.id,
        createdAt: new Date(),
      },
      { transaction }
    );

    if (quantity <= 0) {
      throw new Error("Invalid refund quantity");
    }

    // Catat pengembalian uang
    await Refund.create(
      {
        transaction_id,
        product_id,
        quantity,
        refund_amount: quantity * transactionDetail.sell_price_at_time,
        refunded_by: user.id,
        refunded_at: new Date(),
      },
      { transaction }
    );

    await transaction.commit();
    winston.info(
      `Refund processed: ${quantity} units of Product ID ${product_id} from Transaction ID ${transaction_id}`
    );
    res.json({ message: "Refund processed successfully" });
  } catch (error) {
    await transaction.rollback();
    winston.error(`Error processing refund: ${error.message}`);
    res
      .status(500)
      .json({ error: `Error processing refund: ${error.message}` });
  }
};

// Proses Retur Barang (Mengembalikan ke Stok)
export const returnStock = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { transaction_id, product_id, quantity, reason } = req.body;
    const user = req.user;

    winston.info(
      `Processing return: Transaction ${transaction_id}, Product ${product_id}, Quantity ${quantity}`
    );

    // Cek transaksi & produk
    const existingTransaction = await Transaction.findByPk(transaction_id);
    const product = await Product.findByPk(product_id);

    if (!existingTransaction || !product) {
      return res
        .status(404)
        .json({ error: "Transaction or Product not found" });
    }

    // Cari detail transaksi untuk mengetahui batch asal
    const transactionDetail = await TransactionDetail.findOne({
      where: { transaction_id, product_id },
      transaction,
    });

    if (!transactionDetail) {
      throw new Error(
        "Transaction detail not found, cannot determine batch_id"
      );
    }

    const originalBatch = await Batch.findOne({
      where: { id: transactionDetail.batch_id || null },
      transaction,
    });

    if (!originalBatch) {
      winston.warn(
        `No original batch found for batch_id: ${transactionDetail.batch_id}`
      );
    }

    // Ambil harga batch asal atau harga jual saat transaksi
    const batchPrice = originalBatch.price;

    if (!batchPrice) {
      throw new Error("Price for batch creation cannot be determined");
    }

    // Generate batch ID baru dengan suffix `_RET`
    const returnBatchId = `${originalBatch.id}_RET`;

    // Cari batch retur yang sudah ada (jika ada)
    let returnBatch = await Batch.findOne({
      where: { product_id, status: "returned" },
      transaction,
    });

    if (!returnBatch) {
      winston.info(`Creating new return batch for product ${product_id}`);

      returnBatch = await Batch.create(
        {
          id: returnBatchId,
          product_id,
          price: batchPrice,
          quantity: 0, // Awalnya 0, akan ditambahkan
          by_who: user.id,
          status: "returned",
        },
        { transaction }
      );
    }

    // Tambahkan barang retur ke batch retur
    returnBatch.quantity += quantity;
    await returnBatch.save({ transaction });

    // Simpan data retur
    const newReturn = await Return.create(
      {
        transaction_id,
        product_id,
        batch_id: returnBatch.id,
        quantity,
        reason,
        returned_by: user.id,
      },
      { transaction }
    );

    // Simpan di StockHistory
    await StockHistory.create(
      {
        batch_id: returnBatch.id,
        product_id,
        price_per_unit: batchPrice,
        quantity,
        by_who: user.id,
      },
      { transaction }
    );

    await transaction.commit();
    winston.info(
      `Product ${product_id} returned successfully: ${quantity} units`
    );
    res
      .status(201)
      .json({ message: "Return processed successfully", newReturn });
  } catch (error) {
    await transaction.rollback();
    winston.error("Error processing return:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
};
