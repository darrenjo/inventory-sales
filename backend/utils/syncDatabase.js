import sequelize from "../config/database.js";
// Pastikan semua model diimport agar terdaftar
import "../models/color.js";
import "../models/product.js";
import "../models/refund.js";
import "../models/stockHistory.js";
import "../models/user.js";
import "../models/customer.js";
import "../models/loyality.js";

const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true }); // Gunakan { force: true } jika ingin reset database
    console.log("Database synchronized");
  } catch (error) {
    console.error("Error synchronizing database:", error);
  }
};

export default syncDatabase;
