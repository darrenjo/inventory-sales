import { Op } from "sequelize";
import { Batch } from "../models/product.js";
import StockHistory from "../models/stockHistory.js";

export const reduceStockFIFO = async (
  product_id,
  quantity,
  transaction,
  userId
) => {
  console.log(
    `DEBUG - Starting FIFO reduction for product ${product_id}, Quantity: ${quantity}`
  );

  // Ambil batch dengan stok > 0, urutkan FIFO
  const batches = await Batch.findAll({
    where: { product_id, quantity: { [Op.gt]: 0 } },
    order: [["createdAt", "ASC"]],
    transaction,
  });

  if (!batches || batches.length === 0) {
    console.error("ERROR - No stock available for product:", product_id);
    return []; // Kembalikan array kosong supaya tidak undefined
  }

  console.log(`DEBUG - Available batches for product ${product_id}:`, batches);

  let remainingQty = quantity;
  const usedBatches = []; // 🔥 Menyimpan batch yang dipakai

  for (const batch of batches) {
    if (remainingQty <= 0) break; // Stop jika semua kebutuhan sudah terpenuhi

    const availableQty = batch.dataValues.quantity;
    const toDeduct = Math.min(availableQty, remainingQty);

    console.log(
      `DEBUG - Processing Batch: ${batch.id}, Available: ${batch.quantity}, Remaining: ${remainingQty}`
    );

    batch.quantity -= toDeduct;
    remainingQty -= toDeduct;

    console.log(
      `DEBUG - Deducting ${toDeduct} from Batch ${batch.id}, New Batch Quantity: ${batch.quantity}`
    );

    // Simpan perubahan pada batch
    await batch.save({ transaction });

    if (!batch.price) {
      console.error(`ERROR - Batch ${batch.id} does not have a valid price`);
      throw new Error(`Batch ${batch.id} does not have a valid price`);
    }

    // 🔥 Simpan batch yang dipakai ke dalam usedBatches
    usedBatches.push({
      batch_id: batch.id,
      price: batch.price,
      used_quantity: toDeduct,
    });

    // Catat perubahan di StockHistory
    await StockHistory.create(
      {
        batch_id: batch.id,
        product_id,
        price_per_unit: batch.price,
        quantity: -toDeduct, // Negative karena keluar stok
        by_who: userId,
        createdAt: new Date(),
      },
      { transaction }
    );
  }

  console.log(`DEBUG - RemainingQty after FIFO: ${remainingQty}`);

  if (remainingQty > 0) {
    console.error(`ERROR - Not enough stock for product ID ${product_id}`);
    throw new Error(`Not enough stock for product ID ${product_id}`);
  }

  console.log(`DEBUG - FIFO reduction successful for product ${product_id}`);
  console.log("DEBUG - Used Batches:", usedBatches);

  return usedBatches; // 🔥 Pastikan return ini ada!
};
