import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import User from "./user.js";
import { Product, Transaction, Batch } from "./product.js";

const Return = sequelize.define("Return", {
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
    onDelete: "CASCADE",
  },
  batch_id: {
    type: DataTypes.STRING,
    allowNull: true, // Bisa kosong jika buat batch baru
    references: {
      model: Batch,
      key: "id",
    },
    onDelete: "SET NULL",
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  returned_by: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
    onDelete: "SET NULL",
  },
  returned_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

// Relasi
Transaction.hasMany(Return, { foreignKey: "transaction_id", as: "returns" });
Return.belongsTo(Transaction, {
  foreignKey: "transaction_id",
  as: "transaction",
});

Product.hasMany(Return, { foreignKey: "product_id", as: "returns" });
Return.belongsTo(Product, { foreignKey: "product_id", as: "product" });

Batch.hasMany(Return, { foreignKey: "batch_id", as: "returns" });
Return.belongsTo(Batch, { foreignKey: "batch_id", as: "batch" });

User.hasMany(Return, { foreignKey: "returned_by", as: "returns" });
Return.belongsTo(User, { foreignKey: "returned_by", as: "returnedBy" });

export default Return;
