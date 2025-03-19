import { Permission, RolePermission } from "../models/index.js";
import logger from "../utils/logger.js";

export const authorizePermission =
  (requiredPermission) => async (req, res, next) => {
    try {
      const userRoleId = req.user.roleId; // Role ID dari user

      // Ambil semua permission yang dimiliki oleh role user
      const rolePermissions = await RolePermission.findAll({
        where: { roleId: userRoleId },
        include: [{ model: Permission }],
      });

      // Ambil daftar nama permission dari hasil query
      const userPermissions = rolePermissions.map((rp) => rp.Permission.name);

      // Cek apakah permission yang dibutuhkan ada dalam daftar user
      if (!userPermissions.includes(requiredPermission)) {
        return res
          .status(403)
          .json({ error: "Forbidden: You don't have permission" });
      }

      next(); // Jika lolos, lanjut ke controller
    } catch (error) {
      logger.error("Authorization error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
