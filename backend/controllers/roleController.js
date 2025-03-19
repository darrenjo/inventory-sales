import { Role, Permission, RolePermission } from "../models/index.js";
import logger from "../utils/logger.js";

// Get All Roles
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

// Create Role
export const createRole = async (req, res) => {
  try {
    const { name } = req.body;
    const newRole = await Role.create({ name });
    res.status(201).json(newRole);
  } catch (error) {
    logger.error("❌ Error creating role: " + error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update Role
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

// Delete Role
export const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    await Role.destroy({ where: { id } });
    res.json({ message: "Role deleted successfully" });
  } catch (error) {
    logger.error("❌ Error deleting role: " + error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Assign Permission to Role
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

// Remove Permission from Role
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
