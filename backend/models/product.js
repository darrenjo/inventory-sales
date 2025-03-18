import { Sequelize, DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import User from "./user.js";
import Color from "./color.js";

const Product = sequelize.define("Product", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: { type: DataTypes.STRING, allowNull: false }, // Katun, Combed, dll.
  category: {
    type: DataTypes.ENUM("fabric", "kerah", "manset", "others"),
    allowNull: false,
  },
  color_code: {
    type: DataTypes.STRING,
    allowNull: false,
    references: { model: Color, key: "color_code" },
  }, // Kode warna unik berdasarkan jenis kain
  sell_price: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  by_who: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
  }, // User ID yang melakukan perubahan
});

const Batch = sequelize.define("Batch", {
  id: { type: DataTypes.STRING, primaryKey: true }, // Custom Batch ID
  product_id: { type: DataTypes.UUID, allowNull: false },
  price: { type: DataTypes.INTEGER, allowNull: false }, // Harga beli per batch
  quantity: { type: DataTypes.INTEGER, allowNull: false }, // Jumlah stok per batch
  by_who: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
  }, // User ID yang melakukan perubahan
  status: {
    type: DataTypes.ENUM("new", "returned"), // Menandai batch retur
    defaultValue: "new",
  },
  // date: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.NOW }, // Tanggal masuk
});

export { Product, Batch };
