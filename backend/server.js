import dotenv from "dotenv";
dotenv.config();

// Setup Express & Dependencies
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import logger from "./utils/logger.js";
import { syncDatabase } from "./models/index.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import colorRoutes from "./routes/colorRoutes.js";
import salesRoutes from "./routes/salesRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import roleRoutes from "./routes/roleRoutes.js";
import permissionRoutes from "./routes/permissionRoutes.js";

// Initialize Express
const app = express();
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json());

app.use((req, res, next) => {
  res.on("finish", () => {
    logger.req(`${req.method} ${req.originalUrl} - ${res.statusCode}`);
  });
  next();
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/colors", colorRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/permissions", permissionRoutes);

// Basic Route
app.get("/", (req, res) => {
  res.send("Inventory & Sales API is running");
});

// Start Server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await syncDatabase();
  app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
};

startServer();
