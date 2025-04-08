import { User, Role } from "../models/index.js";
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

export const profile = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const user = await User.findOne({
      where: { id: req.user.id },
      attributes: ["id", "username", "roleId"],
      include: {
        model: Role,
        attributes: ["name"],
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      user: {
        id: user.id,
        username: user.username,
        roleId: user.roleId,
        roleName: user.Role.name, // <--- ini yang penting
      },
    });
  } catch (err) {
    console.error("🔥 Error di profile:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
