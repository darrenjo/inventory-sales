import { Sequelize, DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Customer from "./customer.js";
import { Transaction } from "./transaction.js";

const LoyaltyHistory = sequelize.define(
  "LoyaltyHistory",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    customer_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Customer,
        key: "id",
      },
      onDelete: "CASCADE",
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
    points_added: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    total_points_after: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
  },
  {
    tableName: "loyalty_history",
    timestamps: false,
  }
);

export default LoyaltyHistory;
