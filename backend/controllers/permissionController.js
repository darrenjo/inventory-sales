import { Permission } from "../models/index.js";
import logger from "../utils/logger.js";

// Get All Permissions
export const getAllPermissions = async (req, res) => {
  try {
    const permissions = await Permission.findAll();
    res.json(permissions);
  } catch (error) {
    logger.error("❌ Error fetching permissions: " + error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Create Permission
export const createPermission = async (req, res) => {
  try {
    const { name } = req.body;
    const newPermission = await Permission.create({ name });
    res.status(201).json(newPermission);
  } catch (error) {
    logger.error("❌ Error creating permission: " + error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update Permission
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

// Delete Permission
export const deletePermission = async (req, res) => {
  try {
    const { id } = req.params;
    await Permission.destroy({ where: { id } });
    res.json({ message: "Permission deleted successfully" });
  } catch (error) {
    logger.error("❌ Error deleting permission: " + error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
