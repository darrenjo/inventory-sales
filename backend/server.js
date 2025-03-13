import dotenv from "dotenv";
dotenv.config();

// Setup Express & Dependencies
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import winston from "./utils/logger.js";
import syncDatabase from "./utils/syncDatabase.js";
import sequelize from "./config/database.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import colorRoutes from "./routes/colorRoutes.js";

// Initialize Express
const app = express();
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json());

app.use((req, res, next) => {
  res.on("finish", () => {
    winston.info(`${req.method} ${req.originalUrl} - ${res.statusCode}`);
  });
  next();
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/colors", colorRoutes);

// Basic Route
app.get("/", (req, res) => {
  res.send("Inventory & Sales API is running");
});

// Start Server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await syncDatabase();
  app.listen(PORT, () => winston.info(`Server running on port ${PORT}`));
};

startServer();
