import sequelize from "../config/database.js";
import logger from "../utils/logger.js";
import { Role, Permission } from "../models/index.js";

// ✅ Get All Roles
export const getAllRoles = async (req, res) => {
  try {
    const user = req.user;

    logger.info(`Request to fetch all roles`, {
      userId: user?.id,
      username: user?.username,
    });

    const roles = await Role.findAll({
      include: [{ model: Permission, through: { attributes: [] } }],
    });

    logger.info(`Successfully fetched ${roles.length} roles`, {
      userId: user?.id,
      count: roles.length,
    });

    res.json(roles);
  } catch (error) {
    logger.error(`Error fetching roles: ${error.message}`, {
      stack: error.stack,
      userId: req.user?.id,
    });
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Create Role
export const createRole = async (req, res) => {
  try {
    const { name } = req.body;
    const user = req.user;

    logger.info(`Role creation attempt: "${name}"`, {
      userId: user?.id,
      username: user?.username,
      roleName: name,
    });

    // Validate request
    if (!name) {
      logger.warn(`Role creation failed: Missing name`, {
        userId: user?.id,
        requestBody: req.body,
      });
      return res.status(400).json({ error: "Role name is required" });
    }

    // Check if role name already exists
    const existingRole = await Role.findOne({ where: { name } });
    if (existingRole) {
      logger.warn(`Role creation failed: Name already exists: "${name}"`, {
        userId: user?.id,
        existingRoleId: existingRole.id,
      });
      return res.status(400).json({ error: "Role name already exists" });
    }

    const newRole = await Role.create({ name });

    logger.info(`Role created successfully: "${name}" (ID: ${newRole.id})`, {
      userId: user?.id,
      username: user?.username,
      roleId: newRole.id,
      roleName: name,
    });

    res.status(201).json(newRole);
  } catch (error) {
    logger.error(`Error creating role: ${error.message}`, {
      stack: error.stack,
      requestBody: req.body,
      userId: req.user?.id,
    });
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Update Role
export const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const user = req.user;

    logger.info(`Role update attempt for ID: ${id}`, {
      userId: user?.id,
      username: user?.username,
      roleId: id,
      newName: name,
    });

    if (!name) {
      logger.warn(`Role update failed: Missing name`, {
        userId: user?.id,
        roleId: id,
        requestBody: req.body,
      });
      return res.status(400).json({ error: "Role name is required" });
    }

    const role = await Role.findByPk(id);
    if (!role) {
      logger.warn(`Role update failed: Role not found (ID: ${id})`, {
        userId: user?.id,
        requestedId: id,
      });
      return res.status(404).json({ error: "Role not found" });
    }

    const oldName = role.name;
    await Role.update({ name }, { where: { id } });

    logger.info(
      `Role updated successfully: "${oldName}" → "${name}" (ID: ${id})`,
      {
        userId: user?.id,
        username: user?.username,
        roleId: id,
        changes: {
          from: oldName,
          to: name,
        },
      }
    );

    res.json({ message: "Role updated successfully" });
  } catch (error) {
    logger.error(`Error updating role: ${error.message}`, {
      stack: error.stack,
      roleId: req.params.id,
      requestBody: req.body,
      userId: req.user?.id,
    });
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Delete Role
export const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    logger.info(`Role deletion attempt for ID: ${id}`, {
      userId: user?.id,
      username: user?.username,
      roleId: id,
    });

    const role = await Role.findByPk(id);
    if (!role) {
      logger.warn(`Role deletion failed: Role not found (ID: ${id})`, {
        userId: user?.id,
        requestedId: id,
      });
      return res.status(404).json({ error: "Role not found" });
    }

    const roleName = role.name;
    const deleted = await Role.destroy({ where: { id } });

    if (!deleted) {
      logger.warn(
        `Role deletion failed: Delete operation returned ${deleted}`,
        {
          userId: user?.id,
          roleId: id,
        }
      );
      return res.status(404).json({ error: "Role not found" });
    }

    // Get the maxId from the Roles table
    const [[{ maxId }]] = await sequelize.query(
      'SELECT COALESCE(MAX(id), 0) + 1 AS "maxId" FROM "Roles";'
    );

    // Reset auto-increment sequence
    await sequelize.query(
      `ALTER SEQUENCE "Roles_id_seq" RESTART WITH ${maxId};`
    );

    logger.info(`Role deleted successfully: "${roleName}" (ID: ${id})`, {
      userId: user?.id,
      username: user?.username,
      roleDetails: {
        id: id,
        name: roleName,
      },
      newSequenceValue: maxId,
    });

    res.json({ message: "Role deleted successfully" });
  } catch (error) {
    logger.error(`Error deleting role: ${error.message}`, {
      stack: error.stack,
      roleId: req.params.id,
      userId: req.user?.id,
    });
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Get Role by ID
export const getRoleById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    logger.info(`Request to fetch role with ID: ${id}`, {
      userId: user?.id,
      username: user?.username,
      roleId: id,
    });

    const role = await Role.findByPk(id, {
      include: [{ model: Permission, through: { attributes: [] } }],
    });

    if (!role) {
      logger.warn(`Role fetch failed: Role not found (ID: ${id})`, {
        userId: user?.id,
        requestedId: id,
      });
      return res.status(404).json({ error: "Role not found" });
    }

    logger.info(
      `Successfully fetched role: "${role.name}" with ${
        role.Permissions?.length || 0
      } permissions`,
      {
        userId: user?.id,
        roleId: id,
        roleName: role.name,
        permissionCount: role.Permissions?.length || 0,
      }
    );

    res.json(role);
  } catch (error) {
    logger.error(`Error fetching role: ${error.message}`, {
      stack: error.stack,
      roleId: req.params.id,
      userId: req.user?.id,
    });
    res.status(500).json({ error: "Internal Server Error" });
  }
};
