import sequelize from "../config/database.js";
import { Role, Permission, RolePermission } from "../models/index.js";
import logger from "../utils/logger.js";

const seedRolesAndPermissions = async () => {
  try {
    await sequelize.sync({ force: true }); // Jangan lupa ganti force: true jika ingin menghapus tabel yang sudah ada

    const roles = await Role.bulkCreate([
      { name: "superadmin" },
      { name: "owner" },
      { name: "inventory_staff" },
      { name: "sales_staff" },
    ]);

    const permissions = await Permission.bulkCreate([
      { name: "manage_users" },
      { name: "manage_roles" },
      { name: "manage_products" },
      { name: "manage_stock" },
      { name: "manage_sales" },
      { name: "manage_customers" },
    ]);

    const rolePermissions = [
      { roleId: 1, permissionId: 1 }, // Superadmin - Manage Users
      { roleId: 1, permissionId: 2 }, // Superadmin - Manage Roles
      { roleId: 1, permissionId: 3 }, // Superadmin - Manage Products
      { roleId: 1, permissionId: 4 }, // Superadmin - Manage Products
      { roleId: 1, permissionId: 5 }, // Superadmin - Manage Sales
      { roleId: 1, permissionId: 6 }, // Superadmin - Manage Customer

      { roleId: 2, permissionId: 1 }, // Owner - Manage Users
      { roleId: 2, permissionId: 2 }, // Owner - Manage Roles
      { roleId: 2, permissionId: 3 }, // Owner - Manage Products
      { roleId: 2, permissionId: 4 }, // Owner - Manage Products
      { roleId: 2, permissionId: 5 }, // Owner - Manage Sales
      { roleId: 2, permissionId: 6 }, // Superadmin - Manage Customer

      { roleId: 3, permissionId: 3 }, // Inventory Staff - Manage Products
      { roleId: 3, permissionId: 4 }, // Inventory Staff - Manage Stock

      { roleId: 4, permissionId: 5 }, // Sales Staff - Manage Sales
      { roleId: 4, permissionId: 6 }, // Sales Staff - Manage Customers
    ];

    await RolePermission.bulkCreate(rolePermissions);

    logger.info("✅ Seeder Role & Permission berhasil dijalankan!");
    process.exit(); // Keluar setelah selesai
  } catch (error) {
    logger.error("❌ Error saat menjalankan seeder:", error);
    process.exit(1);
  }
};

seedRolesAndPermissions();
