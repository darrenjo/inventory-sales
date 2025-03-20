import sequelize from "../config/database.js";
import logger from "../utils/logger.js";
import { Role, Permission, RolePermission } from "../models/index.js";

// ✅ Get All Roles
export const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.findAll({
      include: [{ model: Permission, through: { attributes: [] } }],
    });

    res.json(roles);
  } catch (error) {
    logger.error("❌ Error fetching roles: " + error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Create Role
export const createRole = async (req, res) => {
  try {
    const { name } = req.body;

    // Validate request
    if (!name) {
      return res.status(400).json({ error: "Role name is required" });
    }

    // Check if role name already exists
    const existingRole = await Role.findOne({ where: { name } });
    if (existingRole) {
      return res.status(400).json({ error: "Role name already exists" });
    }

    const newRole = await Role.create({ name });
    res.status(201).json(newRole);
  } catch (error) {
    logger.error("❌ Error creating role: " + error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Update Role
export const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    await Role.update({ name }, { where: { id } });

    res.json({ message: "Role updated successfully" });
  } catch (error) {
    logger.error("❌ Error updating role: " + error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Delete Role
export const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Role.destroy({ where: { id } });
    if (!deleted) {
      return res.status(404).json({ error: "Role not found" });
    }

    // Get the maxId from the Permissions table
    const [[{ maxId }]] = await sequelize.query(
      'SELECT COALESCE(MAX(id), 0) + 1 AS "maxId" FROM "Roles";'
    );

    // Reset auto-increment sequence
    await sequelize.query(
      `ALTER SEQUENCE "Roles_id_seq" RESTART WITH ${maxId};`
    );

    res.json({ message: "Role deleted successfully" });
  } catch (error) {
    logger.error("❌ Error deleting role: " + error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Assign Permission to Role
export const assignPermissionToRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissionId } = req.body;

    await RolePermission.create({ roleId: id, permissionId });
    res.json({ message: "Permission assigned successfully" });
  } catch (error) {
    logger.error("❌ Error assigning permission: " + error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Remove Permission from Role
export const removePermissionFromRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissionId } = req.body;

    await RolePermission.destroy({ where: { roleId: id, permissionId } });
    res.json({ message: "Permission removed successfully" });
  } catch (error) {
    logger.error("❌ Error removing permission: " + error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
