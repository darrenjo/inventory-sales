import { Product, Batch, Color, StockHistory } from "../models/index.js";
import logger from "../utils/logger.js";
import { Op } from "sequelize";
import { generateBatchId } from "../utils/generateBatchId.js";

// ✅ Add Product
export const createProduct = async (req, res) => {
  try {
    const { name, category, color_code, sell_price } = req.body;
    const user = req.user; // Ambil data user dari middleware autentikasi

    // Validasi apakah kode warna ada di tabel Color
    const color = await Color.findOne({ where: { color_code } });
    if (!color) {
      return res.status(400).json({ error: "Invalid color code" });
    }

    // Cek apakah jenis kain cocok dengan kode warna
    if (color.fabric_type !== name) {
      return res.status(400).json({
        error: `Color code ${color_code} is not valid for fabric type ${name}`,
      });
    }

    const product = await Product.create({
      name,
      category,
      color_code,
      sell_price,
      by_who: user.id,
    });

    logger.info(`Product created: ${name} by User: ${user.username}`);
    res.status(201).json({ message: "Product created", product });
  } catch (error) {
    logger.error("Error creating product:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ add stock (new batch)
export const addStock = async (req, res) => {
  try {
    const { product_id, price, quantity } = req.body;
    const user = req.user;

    if (!product_id || price <= 0 || quantity <= 0) {
      return res.status(400).json({ error: "Invalid input data" });
    }

    const product = await Product.findByPk(product_id);
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

    logger.info(
      `Stock added: ${quantity} units to ${product.name} (Batch: ${batch.id}) by User: ${user.username}`
    );

    res.status(201).json({ message: "Stock added", batch });
  } catch (error) {
    logger.error("Error adding stock:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Get All Products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.findAll({ include: Batch });

    res.json(products);
  } catch (error) {
    logger.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ delete product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    // Cari produk sebelum dihapus
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    await Product.destroy({ where: { id } });

    logger.info(
      `Product ${product.name} ${product.category} ${product.color_code} deleted by User: ${user.username}`
    );
    res.json({ message: "Product deleted" });
  } catch (error) {
    logger.error("Error deleting product:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ FIFO: Reduce Stock
export const reduceStock = async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    const user = req.user;

    if (!product_id || quantity <= 0) {
      return res.status(400).json({ error: "Invalid input data" });
    }

    // Ambil batch dengan stok > 0 (FIFO)
    const batches = await Batch.findAll({
      where: { product_id, quantity: { [Op.gt]: 0 } }, // Hanya batch yang masih ada stok
      order: [["createdAt", "ASC"]],
    });

    if (!batches || batches.length === 0) {
      return res.status(400).json({ error: "Not enough stock" });
    }

    let remainingQuantity = quantity;
    let updatedBatches = [];

    for (const batch of batches) {
      if (remainingQuantity <= 0) break;

      let deducted = Math.min(batch.quantity, remainingQuantity);
      remainingQuantity -= deducted;

      await StockHistory.create({
        batch_id: batch.id,
        product_id: batch.product_id,
        price_per_unit: batch.price,
        quantity: -deducted, // Simpan histori pengurangan stok
        by_who: user.id,
        createdAt: new Date(),
      });

      batch.quantity -= deducted;
      await batch.save();

      updatedBatches.push({
        batchId: batch.id,
        remainingStock: batch.quantity,
      });
    }

    if (remainingQuantity > 0) {
      return res.status(400).json({ error: "Not enough stock" });
    }

    logger.info(
      `Stock reduced: ${quantity} units from Product ID: ${product_id} by User: ${user.username}`
    );

    res.json({ message: "Stock reduced successfully", updatedBatches });
  } catch (error) {
    logger.error("Error reducing stock:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Get Batches by Product ID
export const getBatchesByProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const batches = await Batch.findAll({ where: { product_id: id } });
    res.json(batches);
  } catch (error) {
    logger.error("Error fetching batches:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
