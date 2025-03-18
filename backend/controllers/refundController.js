import {
  Batch,
  TransactionDetail,
  StockHistory,
  Refund,
} from "../models/index.js";
import logger from "../utils/logger.js";
import sequelize from "../config/database.js";
import { generateBatchId } from "../utils/generateBatchId.js";

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
    logger.info(
      `Refund processed: ${quantity} units of Product ID ${product_id} from Transaction ID ${transaction_id}`
    );
    res.json({ message: "Refund processed successfully" });
  } catch (error) {
    await transaction.rollback();
    logger.error(`Error processing refund: ${error.message}`);
    res
      .status(500)
      .json({ error: `Error processing refund: ${error.message}` });
  }
};
