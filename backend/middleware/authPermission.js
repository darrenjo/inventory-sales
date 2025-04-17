import { Role, Permission } from "../models/index.js";
import logger from "../utils/logger.js";

export const authorizePermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const userRoleId = req.user.roleId;

      // Ambil Role beserta daftar Permission-nya
      const role = await Role.findByPk(userRoleId, {
        include: [{ model: Permission, attributes: ["name"] }],
      });

      if (!role) {
        return res.status(404).json({ error: "Role not found" });
      }

      // Bungkus permission ke dalam Set
      const permissionSet = new Set(role.Permissions.map((p) => p.name));

      // Cek apakah permission yang dibutuhkan ada dalam set
      if (!permissionSet.has(requiredPermission)) {
        return res.status(403).json({
          error: "Forbidden: You don't have the required permission",
        });
      }

      next(); // Lanjut ke route handler
    } catch (error) {
      logger.error("❌ Authorization error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
};
