import User from "../models/user.js";
import winston from "../utils/logger.js";

export const getUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    winston.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
