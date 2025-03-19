import { User } from "../models/index.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import logger from "../utils/logger.js";

export const register = async (req, res) => {
  try {
    const { username, password, roleId } = req.body;
    const user = await User.create({ username, password, roleId });
    res.status(201).json({ message: "User registered" });
  } catch (error) {
    logger.error("Error registering user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, roleId: user.roleId },
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // FOR DEVELOPMENT PURPOSES ONLY
    );
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        // id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error("Error logging in:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
