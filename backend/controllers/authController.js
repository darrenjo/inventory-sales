import { User } from "../models/index.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import logger from "../utils/logger.js";

// ✅ Register User
export const register = async (req, res) => {
  try {
    const { username, password, roleId } = req.body;

    if (!username || !password || !roleId) {
      return res
        .status(400)
        .json({ error: "Username, password, and roleId are required" });
    }

    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(409).json({ error: "Username already exists" });
    }

    const user = await User.create({ username, password, roleId });

    res.status(201).json({ message: "User registered" });
  } catch (error) {
    logger.error("Error registering user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Login User
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

    res.cookie("token", token, {
      httpOnly: true, // Cookie tidak bisa diakses dari frontend (lebih aman)
      secure: process.env.NODE_ENV === "production", // Hanya pakai secure di production
      sameSite: "strict", // Cegah CSRF
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.roleId,
      },
    });
  } catch (error) {
    logger.error("Error logging in:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });
  res.status(200).json({ message: "Logged out" });
};
