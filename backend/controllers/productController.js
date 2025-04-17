import { Product, Batch, Color, StockHistory } from "../models/index.js";
import logger from "../utils/logger.js";
import { Op } from "sequelize";
import { generateBatchId } from "../utils/generateBatchId.js";

// ✅ Add Product
export const createProduct = async (req, res) => {
  try {
    const { name, category, color_code, sell_price } = req.body;
    const user = req.user;

    logger.info(
      `Product creation attempt: ${name} (${color_code}) by ${user.username}`,
      {
        userId: user.id,
        productData: { name, category, color_code, sell_price },
      }
    );

    // color_code validation from Color tabel
    const color = await Color.findOne({ where: { color_code } });
    if (!color) {
      logger.warn(`Product creation failed: Invalid color code ${color_code}`, {
        userId: user.id,
        attemptedColorCode: color_code,
      });
      return res.status(400).json({ error: "Invalid color code" });
    }

    // color_code must matched with fabric type
    if (color.fabric_type !== name) {
      logger.warn(
        `Product creation failed: Color code ${color_code} mismatch with fabric type ${name}`,
        {
          userId: user.id,
          colorCode: color_code,
          fabricType: name,
          expectedFabricType: color.fabric_type,
        }
      );
      return res.status(400).json({
        error: `Color code ${color_code} is not valid for fabric type ${name}`,
      });
    }

    // check duplicated color_code in Product tabel
    const existingProduct = await Product.findOne({ where: { color_code } });
    if (existingProduct) {
      logger.warn(
        `Product creation failed: Duplicate color code ${color_code}`,
        {
          userId: user.id,
          existingProductId: existingProduct.id,
        }
      );
      return res.status(409).json({
        error: `Product with color code ${color_code} already exists`,
      });
    }

    // Insert
    const product = await Product.create({
      name,
      category,
      color_code,
      sell_price,
      by_who: user.id,
    });

    logger.info(
      `Product created successfully: ${name} (${color_code}) by ${user.username}`,
      {
        userId: user.id,
        productId: product.id,
        productDetails: { name, category, color_code, sell_price },
      }
    );
    res.status(201).json({ message: "Product created", product });
  } catch (error) {
    logger.error(`Error creating product: ${error.message}`, {
      stack: error.stack,
      requestBody: req.body,
      userId: req.user?.id,
    });
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ add stock (new batch)
export const addStock = async (req, res) => {
  try {
    const { product_id, price, quantity } = req.body;
    const user = req.user;

    logger.info(`Stock addition attempt for product ID: ${product_id}`, {
      userId: user.id,
      stockData: { product_id, price, quantity },
    });

    if (!product_id || price <= 0 || quantity <= 0) {
      logger.warn(`Stock addition failed: Invalid input data`, {
        userId: user.id,
        invalidData: { product_id, price, quantity },
      });
      return res.status(400).json({ error: "Invalid input data" });
    }

    const product = await Product.findByPk(product_id);
    if (!product) {
      logger.warn(
        `Stock addition failed: Product not found (ID: ${product_id})`,
        {
          userId: user.id,
        }
      );
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
      `Stock added successfully: ${quantity} units to ${product.name} (Batch: ${batch.id})`,
      {
        userId: user.id,
        username: user.username,
        productId: product_id,
        productName: product.name,
        batchId: batch.id,
        quantity: quantity,
        price: price,
      }
    );

    res.status(201).json({ message: "Stock added", batch });
  } catch (error) {
    logger.error(`Error adding stock: ${error.message}`, {
      stack: error.stack,
      requestBody: req.body,
      userId: req.user?.id,
    });
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Get All Products
export const getProducts = async (req, res) => {
  try {
    logger.info(`Request to fetch all products`);

    const products = await Product.findAll({ include: Batch });

    logger.info(`Successfully fetched ${products.length} products`);
    res.json(products);
  } catch (error) {
    logger.error(`Error fetching products: ${error.message}`, {
      stack: error.stack,
    });
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ delete product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    logger.info(`Product deletion attempt for ID: ${id}`, {
      userId: user.id,
      username: user.username,
    });

    // Cari produk sebelum dihapus
    const product = await Product.findByPk(id);
    if (!product) {
      logger.warn(`Product deletion failed: Product not found (ID: ${id})`, {
        userId: user.id,
      });
      return res.status(404).json({ error: "Product not found" });
    }

    await Product.destroy({ where: { id } });

    logger.info(
      `Product deleted successfully: ${product.name} (${product.color_code})`,
      {
        userId: user.id,
        username: user.username,
        productDetails: {
          id: product.id,
          name: product.name,
          category: product.category,
          color_code: product.color_code,
        },
      }
    );
    res.json({ message: "Product deleted" });
  } catch (error) {
    logger.error(`Error deleting product: ${error.message}`, {
      stack: error.stack,
      productId: req.params.id,
      userId: req.user?.id,
    });
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ FIFO: Reduce Stock
export const reduceStock = async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    const user = req.user;

    logger.info(
      `Stock reduction attempt for product ID: ${product_id}, quantity: ${quantity}`,
      {
        userId: user.id,
        username: user.username,
      }
    );

    if (!product_id || quantity <= 0) {
      logger.warn(`Stock reduction failed: Invalid input data`, {
        userId: user.id,
        invalidData: { product_id, quantity },
      });
      return res.status(400).json({ error: "Invalid input data" });
    }

    // Ambil batch dengan stok > 0 (FIFO)
    const batches = await Batch.findAll({
      where: { product_id, quantity: { [Op.gt]: 0 } }, // Hanya batch yang masih ada stok
      order: [["createdAt", "ASC"]],
    });

    if (!batches || batches.length === 0) {
      logger.warn(
        `Stock reduction failed: No available stock for product ID: ${product_id}`,
        {
          userId: user.id,
        }
      );
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

      logger.debug(`Deducted ${deducted} units from batch ${batch.id}`, {
        batchId: batch.id,
        deducted,
        remaining: batch.quantity,
      });
    }

    if (remainingQuantity > 0) {
      logger.warn(
        `Stock reduction failed: Insufficient stock (needed: ${quantity}, short by: ${remainingQuantity})`,
        {
          userId: user.id,
          productId: product_id,
        }
      );
      return res.status(400).json({ error: "Not enough stock" });
    }

    logger.info(
      `Stock reduced successfully: ${quantity} units from Product ID: ${product_id}`,
      {
        userId: user.id,
        username: user.username,
        productId: product_id,
        quantity: quantity,
        updatedBatches: updatedBatches.map((b) => ({
          batchId: b.batchId,
          remaining: b.remainingStock,
        })),
      }
    );

    res.json({ message: "Stock reduced successfully", updatedBatches });
  } catch (error) {
    logger.error(`Error reducing stock: ${error.message}`, {
      stack: error.stack,
      requestBody: req.body,
      userId: req.user?.id,
    });
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Get Batches by Product ID
export const getBatchesByProduct = async (req, res) => {
  try {
    const { id } = req.params;

    logger.info(`Request to fetch batches for product ID: ${id}`);

    const batches = await Batch.findAll({ where: { product_id: id } });

    logger.info(
      `Successfully fetched ${batches.length} batches for product ID: ${id}`
    );
    res.json(batches);
  } catch (error) {
    logger.error(`Error fetching batches: ${error.message}`, {
      stack: error.stack,
      productId: req.params.id,
    });
    res.status(500).json({ error: "Internal Server Error" });
  }
};
