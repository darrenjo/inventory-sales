import sequelize from "../config/database.js";
import logger from "../utils/logger.js";

import "./color.js";
import "./customer.js";
import "./loyality.js";
import "./product.js";
import "./refund.js";
import "./return.js";
import "./stockHistory.js";
import "./user.js";
import "./transaction.js";
import "./role.js";
import "./permission.js";
import "./rolePermission.js";

import Color from "./color.js";
import Customer from "./customer.js";
import LoyaltyHistory from "./loyality.js";
import { Product, Batch } from "./product.js";
import Refund from "./refund.js";
import Return from "./return.js";
import StockHistory from "./stockHistory.js";
import User from "./user.js";
import { Transaction, TransactionDetail } from "./transaction.js";
import Role from "./role.js";
import Permission from "./permission.js";
import RolePermission from "./rolePermission.js";

User.belongsTo(Role, { foreignKey: "roleId", as: "role" });

User.hasMany(Color, { foreignKey: "by_who" });
Color.belongsTo(User, { foreignKey: "by_who" });

Customer.hasMany(LoyaltyHistory, {
  foreignKey: "customer_id",
  onDelete: "CASCADE",
});
LoyaltyHistory.belongsTo(Customer, { foreignKey: "customer_id" });
Transaction.hasOne(LoyaltyHistory, {
  foreignKey: "transaction_id",
  onDelete: "CASCADE",
});
LoyaltyHistory.belongsTo(Transaction, { foreignKey: "transaction_id" });

// Relasi Produk, Batch, User, dan Color
User.hasMany(Batch, { foreignKey: "by_who" });
Batch.belongsTo(User, { foreignKey: "by_who" });

User.hasMany(Product, { foreignKey: "by_who" });
Product.belongsTo(User, { foreignKey: "by_who" });

Product.hasMany(Batch, { foreignKey: "product_id", onDelete: "CASCADE" });
Batch.belongsTo(Product, { foreignKey: "product_id" });

Color.hasMany(Product, { foreignKey: "color_code" });
Product.belongsTo(Color, { foreignKey: "color_code" });

Transaction.hasMany(Refund, { foreignKey: "transaction_id", as: "refunds" });
Refund.belongsTo(Transaction, {
  foreignKey: "transaction_id",
  as: "transaction",
});

Product.hasMany(Refund, { foreignKey: "product_id", as: "refunds" });
Refund.belongsTo(Product, { foreignKey: "product_id", as: "product" });

User.hasMany(Refund, { foreignKey: "refunded_by", as: "refunds" });
Refund.belongsTo(User, { foreignKey: "refunded_by", as: "refundedBy" });

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

User.hasMany(StockHistory, { foreignKey: "by_who" });
StockHistory.belongsTo(User, { foreignKey: "by_who" });

Transaction.hasMany(TransactionDetail, { foreignKey: "transaction_id" });
TransactionDetail.belongsTo(Transaction, { foreignKey: "transaction_id" });

Batch.hasMany(TransactionDetail, { foreignKey: "batch_id" });
TransactionDetail.belongsTo(Batch, { foreignKey: "batch_id" });

User.hasMany(Transaction, { foreignKey: "sales_staff_id" });
Transaction.belongsTo(User, { foreignKey: "sales_staff_id" });

Customer.hasMany(Transaction, {
  foreignKey: "customer_id",
  onDelete: "SET NULL",
});
Transaction.belongsTo(Customer, { foreignKey: "customer_id" });

// Relasi Many-to-Many Role <-> Permission
Role.belongsToMany(Permission, {
  through: RolePermission,
  foreignKey: "roleId",
});
Permission.belongsToMany(Role, {
  through: RolePermission,
  foreignKey: "permissionId",
});

RolePermission.belongsTo(Role, { foreignKey: "roleId" });
RolePermission.belongsTo(Permission, { foreignKey: "permissionId" });

User.belongsTo(Role, { foreignKey: "roleId" });
Role.hasMany(User, { foreignKey: "roleId" });

const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true, force: false });
    logger.info("✅ Database synced successfully");
  } catch (error) {
    logger.error(`❌ Error syncing database: ${error.message}`);
  }
};

export {
  sequelize,
  Color,
  Customer,
  LoyaltyHistory,
  Product,
  Batch,
  Refund,
  Return,
  StockHistory,
  User,
  Transaction,
  TransactionDetail,
  syncDatabase,
  Role,
  Permission,
  RolePermission,
};
