import { Product, Batch } from "../models/product.js";
import winston from "../utils/logger.js";
import { Op, fn, col, literal } from "sequelize";
import sequelize from "../config/database.js"; // Gunakan transaksi SQL untuk keamanan
import { reduceStockFIFO } from "../utils/reduceStockFIFO.js";
import crypto from "crypto";
import { TransactionDetail, Transaction } from "../models/product.js";
import StockHistory from "../models/stockHistory.js";

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
    return res.status(400).json({ error: "Sales data is required" });
  }

  const transaction = await sequelize.transaction();
  try {
    let totalPrice = 0;
    const transactionId = crypto.randomUUID(); // Generate UUID untuk transaksi

    console.log("DEBUG - Transaction Started, ID:", transactionId);

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

      console.log(
        "DEBUG - Processing product:",
        product_id,
        "Quantity:",
        quantity
      );

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
    console.log("DEBUG - Transaction Committed:", transactionId);
    res.json({ message: "Transaction completed successfully", transactionId });
  } catch (error) {
    await transaction.rollback();
    console.error(`ERROR - Transaction failed: ${error.message}`);
    res
      .status(500)
      .json({ error: `Error processing transaction: ${error.message}` });
  }
};
