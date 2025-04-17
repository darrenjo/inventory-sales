import { User } from "../models/index.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import logger from "../utils/logger.js";

// ✅ Register User
export const register = async (req, res) => {
  try {
    const { username, password, roleId } = req.body;

    // Log request attempt
    logger.info(
      `Registration attempt for username: ${username}, roleId: ${roleId}`
    );

    if (!username || !password || !roleId) {
      logger.warn(`Registration failed: Missing required fields`, {
        provided: {
          username: !!username,
          password: !!password,
          roleId: !!roleId,
        },
      });
      return res
        .status(400)
        .json({ error: "Username, password, and roleId are required" });
    }

    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      logger.warn(`Registration failed: Username '${username}' already exists`);
      return res.status(409).json({ error: "Username already exists" });
    }

    const user = await User.create({
      username,
      password,
      roleId,
      is_active: true,
    });

    logger.info(
      `User registered successfully: ${username} with roleId: ${roleId}`,
      {
        userId: user.id,
      }
    );
    res.status(201).json({ message: "User registered" });
  } catch (error) {
    logger.error(`Error registering user: ${error.message}`, {
      stack: error.stack,
      username: req.body?.username,
    });
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Login User
export const login = async (req, res) => {
  try {
    const { username } = req.body;

    // Log login attempt
    logger.info(`Login attempt for user: ${username}`);

    const user = await User.findOne({ where: { username } });
    if (!user) {
      logger.warn(`Login failed: User '${username}' not found`);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const passwordValid = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!passwordValid) {
      logger.warn(`Login failed: Invalid password for user '${username}'`);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // ⛔️ Tambahan: cek apakah user masih aktif
    if (!user.is_active) {
      logger.warn(`Login rejected: Account '${username}' is inactive`);
      return res.status(403).json({ error: "Account is inactive" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, roleId: user.roleId },
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // FOR DEVELOPMENT PURPOSES ONLY
    );

    logger.info(`User '${username}' logged in successfully`, {
      userId: user.id,
      roleId: user.roleId,
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
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
    logger.error(`Error during login: ${error.message}`, {
      stack: error.stack,
      username: req.body?.username,
    });
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const logout = async (req, res) => {
  // Extract user info from token if available
  const username = req.user?.username || "Unknown user";

  logger.info(`Logout request for user: ${username}`);

  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });

  logger.info(`User '${username}' logged out successfully`);
  res.status(200).json({ message: "Logged out" });
};
