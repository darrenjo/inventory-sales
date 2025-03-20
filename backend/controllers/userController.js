import { User } from "../models/index.js";
import logger from "../utils/logger.js";

// ✅ Get all users
export const getUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    logger.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
