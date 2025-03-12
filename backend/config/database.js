import { Sequelize } from "sequelize";
import winston from "../utils/logger.js";
import dotenv from "dotenv";

dotenv.config();

if (
  !process.env.PGHOST ||
  !process.env.PGDATABASE ||
  !process.env.PGUSER ||
  !process.env.PGPASSWORD
) {
  throw new Error(
    "Salah satu atau lebih variabel environment PostgreSQL tidak ditemukan di .env"
  );
}

const sequelize = new Sequelize(
  process.env.PGDATABASE, // Nama database
  process.env.PGUSER, // Username
  process.env.PGPASSWORD,
  {
    host: process.env.PGHOST,
    port: process.env.PGPORT || 5432,
    dialect: "postgres",
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false },
    },
    logging: false,
  }
);

sequelize
  .authenticate()
  .then(() => winston.info("Database connected"))
  .catch((err) => winston.error("Database connection error:", err));

export default sequelize;
