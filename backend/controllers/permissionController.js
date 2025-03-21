import { Permission, RolePermission } from "../models/index.js";
import sequelize from "../config/database.js";
import logger from "../utils/logger.js";

// ✅ Get All Permissions
export const getAllPermissions = async (req, res) => {
  try {
    const permissions = await Permission.findAll();

    res.json(permissions);
  } catch (error) {
    logger.error("❌ Error fetching permissions: " + error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Create Permission
export const createPermission = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Permission name is required" });
    }

    // Check if permission name already exists
    const existingPermission = await Permission.findOne({ where: { name } });
    if (existingPermission) {
      return res.status(400).json({ error: "Permission name already exists" });
    }

    const newPermission = await Permission.create({ name });
    res.status(201).json(newPermission);
  } catch (error) {
    logger.error("❌ Error creating permission: " + error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Update Permission
export const updatePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    await Permission.update({ name }, { where: { id } });
    res.json({ message: "Permission updated successfully" });
  } catch (error) {
    logger.error("❌ Error updating permission: " + error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Delete Permission
export const deletePermission = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Permission.destroy({ where: { id } });
    if (!deleted) {
      return res.status(404).json({ error: "Permission not found" });
    }

    // Get the maxId from the Permissions table
    const [[{ maxId }]] = await sequelize.query(
      'SELECT COALESCE(MAX(id), 0) + 1 AS "maxId" FROM "Permissions";'
    );

    // Reset auto-increment sequence
    await sequelize.query(
      `ALTER SEQUENCE "Permissions_id_seq" RESTART WITH ${maxId};`
    );

    res.json({ message: "Permission deleted successfully" });
  } catch (error) {
    logger.error("❌ Error deleting permission: " + error.message);
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
