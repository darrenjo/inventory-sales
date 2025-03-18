import { Sequelize, DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import User from "./user.js";

const StockHistory = sequelize.define(
  "StockHistory",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    batch_id: { type: DataTypes.STRING, allowNull: false },
    product_id: { type: DataTypes.UUID, allowNull: false },
    price_per_unit: { type: DataTypes.INTEGER, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false }, // Bisa negatif untuk pengurangan stok
    by_who: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    }, // User ID yang melakukan perubahan
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
  },
  {
    timestamps: false,
  }
);

export default StockHistory;
