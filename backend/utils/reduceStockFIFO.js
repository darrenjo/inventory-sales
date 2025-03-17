import { Op } from "sequelize";
import { Batch } from "../models/product.js";
import StockHistory from "../models/stockHistory.js";
import logger from "./logger.js";

export const reduceStockFIFO = async (
  product_id,
  quantity,
  transaction,
  userId
) => {
  logger.info(
    `Starting FIFO stock reduction - Product: ${product_id}, Quantity: ${quantity}`
  );

  // Ambil batch dengan stok > 0, urutkan FIFO
  const batches = await Batch.findAll({
    where: { product_id, quantity: { [Op.gt]: 0 } },
    order: [["createdAt", "ASC"]],
    transaction,
  });

  if (!batches || batches.length === 0) {
    logger.error(`No stock available for product ${product_id}`);
    return []; // Kembalikan array kosong supaya tidak undefined
  }

  let remainingQty = quantity;
  const usedBatches = []; // Menyimpan batch yang dipakai

  for (const batch of batches) {
    if (remainingQty <= 0) break; // Stop jika semua kebutuhan sudah terpenuhi

    const availableQty = batch.dataValues.quantity;
    const toDeduct = Math.min(availableQty, remainingQty);

    batch.quantity -= toDeduct;
    remainingQty -= toDeduct;

    // Simpan perubahan pada batch
    await batch.save({ transaction });

    if (!batch.price) {
      logger.error(`Batch ${batch.id} does not have a valid price`);
      throw new Error(`Batch ${batch.id} does not have a valid price`);
    }

    // Simpan batch yang dipakai ke dalam usedBatches
    usedBatches.push({
      batch_id: batch.id,
      price: batch.price,
      used_quantity: toDeduct,
    });

    // Catat perubahan di StockHistory
    // await StockHistory.create(
    //   {
    //     batch_id: batch.id,
    //     product_id,
    //     price_per_unit: batch.price,
    //     quantity: -toDeduct, // Negative karena keluar stok
    //     by_who: userId,
    //     createdAt: new Date(),
    //   },
    //   { transaction }
    // );
  }

  if (remainingQty > 0) {
    logger.error(`Not enough stock for product ID ${product_id}`);
    throw new Error(`Not enough stock for product ID ${product_id}`);
  }

  logger.info(`FIFO stock reduction successful for product ${product_id}`);
  return usedBatches;
};
