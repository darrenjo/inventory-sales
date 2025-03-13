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
    defaultValue: 0, // Default harga jual agar tidak null
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
  date: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.NOW }, // Tanggal masuk
});

const Transaction = sequelize.define(
  "Transaction",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    sales_staff_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    total_price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "transactions",
    timestamps: false,
  }
);

const TransactionDetail = sequelize.define(
  "TransactionDetail",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    transaction_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Transaction,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Product,
        key: "id",
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sell_price_at_time: { type: DataTypes.INTEGER, allowNull: false }, // Harga jual saat transaksi
  },
  {
    tableName: "transaction_details",
    timestamps: true,
  }
);

// Relasi Transaction dan TransactionDetail
Transaction.hasMany(TransactionDetail, { foreignKey: "transaction_id" });
TransactionDetail.belongsTo(Transaction, { foreignKey: "transaction_id" });

Batch.hasMany(TransactionDetail, { foreignKey: "batch_id" });
TransactionDetail.belongsTo(Batch, { foreignKey: "batch_id" });

User.hasMany(Transaction, { foreignKey: "sales_staff_id" });
Transaction.belongsTo(User, { foreignKey: "sales_staff_id" });

// Relasi Produk, Batch, User, dan Color
User.hasMany(Batch, { foreignKey: "by_who" });
Batch.belongsTo(User, { foreignKey: "by_who" });

User.hasMany(Product, { foreignKey: "by_who" });
Product.belongsTo(User, { foreignKey: "by_who" });

Product.hasMany(Batch, { foreignKey: "product_id", onDelete: "CASCADE" });
Batch.belongsTo(Product, { foreignKey: "product_id" });

Color.hasMany(Product, { foreignKey: "color_code" });
Product.belongsTo(Color, { foreignKey: "color_code" });

export { Product, Batch, TransactionDetail, Transaction };
