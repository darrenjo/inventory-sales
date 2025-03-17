import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Customer = sequelize.define(
  "Customer",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
    },
    total_spent: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    points: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    membership_tier: {
      type: DataTypes.ENUM(
        "Default",
        "Starter",
        "Regular",
        "Bronze",
        "Silver",
        "Gold",
        "Platinum"
      ),
      defaultValue: "Default",
    },
    last_transaction_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "Customers",
    timestamps: true,
  }
);

export default Customer;
