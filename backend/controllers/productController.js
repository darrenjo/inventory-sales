import { Product, Batch } from "../models/product.js";
import StockHistory from "../models/stockHistory.js";
import winston from "../utils/logger.js";

// ✅ Tambah Produk Baru
export const createProduct = async (req, res) => {
  try {
    const { name, category, color_code } = req.body;
    const user = req.user; // Ambil data user dari middleware autentikasi
    const product = await Product.create({
      name,
      category,
      color_code,
      by_who: user.id,
    });

    winston.info(`Product created: ${name} by User: ${user.username}`);
    res.status(201).json({ message: "Product created", product });
  } catch (error) {
    winston.error("Error creating product:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Tambah Stok (Batch Baru)
export const addStock = async (req, res) => {
  try {
    const { product_id, price, quantity } = req.body;
    const product = await Product.findByPk(product_id);
    const user = req.user; // Ambil data user dari middleware autentikasi
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const batchId = generateBatchId(product.name, product_id);

    const batch = await Batch.create({
      id: batchId,
      product_id,
      price,
      quantity,
      by_who: user.id,
    });

    winston.info(
      `Stock added: ${quantity} units to ${product.name} by User: ${user.username}`
    );
    res.status(201).json({ message: "Stock added", batch });
  } catch (error) {
    winston.error("Error adding stock:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Lihat Semua Produk
export const getProducts = async (req, res) => {
  try {
    const products = await Product.findAll({ include: Batch });
    res.json(products);
  } catch (error) {
    winston.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Hapus Produk
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    // Cari produk sebelum dihapus
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Simpan nama produk sebelum dihapus
    // const productName = product.name;

    await Product.destroy({ where: { id } });

    winston.info(
      `Product ${product.name} ${product.category} ${product.color_code} deleted by User: ${user.username}`
    );
    res.json({ message: "Product deleted" });
  } catch (error) {
    winston.error("Error deleting product:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ FIFO: Kurangi Stok
export const reduceStock = async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    const user = req.user;

    const batches = await Batch.findAll({
      where: { product_id },
      order: [["date", "ASC"]], // FIFO (batch terlama digunakan lebih dulu)
    });

    let remainingQuantity = quantity;
    let historyRecords = [];
    let updatedBatches = [];

    for (const batch of batches) {
      if (remainingQuantity <= 0) break;

      let deducted = Math.min(batch.quantity, remainingQuantity);
      remainingQuantity -= deducted;

      // ✅ Simpan histori transaksi SEBELUM mengupdate batch
      const history = await StockHistory.create({
        batch_id: batch.id,
        product_id: batch.product_id,
        price: batch.price,
        quantity: -deducted, // Simpan histori pengurangan stok
        by_who: user.id,
        date: new Date(),
      });

      // winston.info(
      //   `Stock history recorded: ${JSON.stringify(history.toJSON())}`
      // );

      batch.quantity -= deducted;
      await batch.save(); // ✅ Update batch setelah histori tersimpan

      // 🔹 Panggil getBatchStock untuk mengetahui stok terbaru
      const updatedStock = await getBatchStock(batch.id);
      updatedBatches.push({ batchId: batch.id, remainingStock: updatedStock });
    }

    if (remainingQuantity > 0) {
      return res.status(400).json({ error: "Not enough stock" });
    }

    // await StockHistory.bulkCreate(historyRecords); // ✅ Simpan histori transaksi

    winston.info(
      `Stock reduced: ${quantity} units from Product ID: ${product_id} by User: ${user.username}`
    );
    res.json({ message: "Stock reduced successfully", updatedBatches });
  } catch (error) {
    winston.error("Error reducing stock:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getBatchesByProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const batches = await Batch.findAll({ where: { product_id: id } });
    res.json(batches);
  } catch (error) {
    winston.error("Error fetching batches:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getBatchStock = async (batchId) => {
  const totalStock = await Batch.sum("quantity", { where: { id: batchId } });
  return totalStock || 0; // Jika tidak ada, return 0
};

const generateBatchId = (productName, productId) => {
  const currentYear = new Date().getFullYear().toString().slice(-2); // 25
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0"); // 03
  const shortName = productName.substring(0, 3).toUpperCase(); // KAT
  const timestamp = Math.floor(Date.now() / 1000); // Detik UNIX

  return `${shortName}${currentYear}_${currentMonth}${timestamp}`;
};
