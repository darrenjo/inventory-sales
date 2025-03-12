import sequelize from "../config/database.js";
// Pastikan semua model diimport agar terdaftar
import "../models/user.js";

const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true }); // Gunakan { force: true } jika ingin reset database
    console.log("Database synchronized");
  } catch (error) {
    console.error("Error synchronizing database:", error);
  }
};

export default syncDatabase;
