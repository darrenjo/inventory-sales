import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import User from "./user.js";
import { Product } from "./product.js";
import { Transaction } from "./transaction.js";

const Refund = sequelize.define(
  "Refund",
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
      onDelete: "CASCADE",
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    refund_amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    refunded_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "SET NULL",
    },
    refunded_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false,
  }
);

export default Refund;
