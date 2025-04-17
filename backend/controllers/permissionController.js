import { Permission, RolePermission, Role } from "../models/index.js";
import sequelize from "../config/database.js";
import logger from "../utils/logger.js";

// ✅ Get All Permissions
export const getAllPermissions = async (req, res) => {
  try {
    const user = req.user;

    logger.info(`Request to fetch all permissions`, {
      userId: user?.id,
      username: user?.username,
    });

    const permissions = await Permission.findAll();

    logger.info(`Successfully fetched ${permissions.length} permissions`, {
      userId: user?.id,
      count: permissions.length,
    });

    res.json(permissions);
  } catch (error) {
    logger.error(`Error fetching permissions: ${error.message}`, {
      stack: error.stack,
      userId: req.user?.id,
    });
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Create Permission
export const createPermission = async (req, res) => {
  try {
    const { name } = req.body;
    const user = req.user;

    logger.info(`Permission creation attempt: "${name}"`, {
      userId: user?.id,
      username: user?.username,
      permissionName: name,
    });

    if (!name) {
      logger.warn(`Permission creation failed: Missing name`, {
        userId: user?.id,
        requestBody: req.body,
      });
      return res.status(400).json({ error: "Permission name is required" });
    }

    // Check if permission name already exists
    const existingPermission = await Permission.findOne({ where: { name } });
    if (existingPermission) {
      logger.warn(
        `Permission creation failed: Name already exists: "${name}"`,
        {
          userId: user?.id,
          existingPermissionId: existingPermission.id,
        }
      );
      return res.status(400).json({ error: "Permission name already exists" });
    }

    const newPermission = await Permission.create({ name });

    logger.info(
      `Permission created successfully: "${name}" (ID: ${newPermission.id})`,
      {
        userId: user?.id,
        username: user?.username,
        permissionId: newPermission.id,
        permissionName: name,
      }
    );

    res.status(201).json(newPermission);
  } catch (error) {
    logger.error(`Error creating permission: ${error.message}`, {
      stack: error.stack,
      requestBody: req.body,
      userId: req.user?.id,
    });
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Update Permission
export const updatePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const user = req.user;

    logger.info(`Permission update attempt for ID: ${id}`, {
      userId: user?.id,
      username: user?.username,
      permissionId: id,
      newName: name,
    });

    const permission = await Permission.findByPk(id);
    if (!permission) {
      logger.warn(
        `Permission update failed: Permission not found (ID: ${id})`,
        {
          userId: user?.id,
          requestedId: id,
        }
      );
      return res.status(404).json({ error: "Permission not found" });
    }

    const oldName = permission.name;
    await Permission.update({ name }, { where: { id } });

    logger.info(
      `Permission updated successfully: "${oldName}" → "${name}" (ID: ${id})`,
      {
        userId: user?.id,
        username: user?.username,
        permissionId: id,
        changes: {
          from: oldName,
          to: name,
        },
      }
    );

    res.json({ message: "Permission updated successfully" });
  } catch (error) {
    logger.error(`Error updating permission: ${error.message}`, {
      stack: error.stack,
      permissionId: req.params.id,
      requestBody: req.body,
      userId: req.user?.id,
    });
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Delete Permission
export const deletePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    logger.info(`Permission deletion attempt for ID: ${id}`, {
      userId: user?.id,
      username: user?.username,
      permissionId: id,
    });

    const permission = await Permission.findByPk(id);
    if (!permission) {
      logger.warn(
        `Permission deletion failed: Permission not found (ID: ${id})`,
        {
          userId: user?.id,
          requestedId: id,
        }
      );
      return res.status(404).json({ error: "Permission not found" });
    }

    const permissionName = permission.name;
    const deleted = await Permission.destroy({ where: { id } });

    if (!deleted) {
      logger.warn(
        `Permission deletion failed: Delete operation returned ${deleted}`,
        {
          userId: user?.id,
          permissionId: id,
        }
      );
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

    logger.info(
      `Permission deleted successfully: "${permissionName}" (ID: ${id})`,
      {
        userId: user?.id,
        username: user?.username,
        permissionDetails: {
          id: id,
          name: permissionName,
        },
        newSequenceValue: maxId,
      }
    );

    res.json({ message: "Permission deleted successfully" });
  } catch (error) {
    logger.error(`Error deleting permission: ${error.message}`, {
      stack: error.stack,
      permissionId: req.params.id,
      userId: req.user?.id,
    });
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Assign Permission to Role
export const assignPermissionToRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissionId } = req.body;
    const user = req.user;

    logger.info(
      `Attempting to assign permission ID: ${permissionId} to role ID: ${id}`,
      {
        userId: user?.id,
        username: user?.username,
        roleId: id,
        permissionId: permissionId,
      }
    );

    const role = await Role.findByPk(id);
    if (!role) {
      logger.warn(`Permission assignment failed: Role not found (ID: ${id})`, {
        userId: user?.id,
        requestedRoleId: id,
      });
      return res.status(404).json({ error: "Role not found" });
    }

    const permission = await Permission.findByPk(permissionId);
    if (!permission) {
      logger.warn(
        `Permission assignment failed: Permission not found (ID: ${permissionId})`,
        {
          userId: user?.id,
          requestedPermissionId: permissionId,
        }
      );
      return res.status(404).json({ error: "Permission not found" });
    }

    const existing = await RolePermission.findOne({
      where: { roleId: id, permissionId },
    });

    if (existing) {
      logger.warn(
        `Permission assignment failed: Already assigned (Role: ${id}, Permission: ${permissionId})`,
        {
          userId: user?.id,
          roleId: id,
          permissionId: permissionId,
        }
      );
      return res
        .status(409)
        .json({ error: "Permission already assigned to this role" });
    }

    await RolePermission.create({ roleId: id, permissionId });

    logger.info(
      `Permission assigned successfully: "${permission.name}" to role "${role.name}"`,
      {
        userId: user?.id,
        username: user?.username,
        roleId: id,
        roleName: role.name,
        permissionId: permissionId,
        permissionName: permission.name,
      }
    );

    res.json({ message: "Permission assigned successfully" });
  } catch (error) {
    logger.error(`Error assigning permission: ${error.message}`, {
      stack: error.stack,
      roleId: req.params.id,
      permissionId: req.body.permissionId,
      userId: req.user?.id,
    });
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Assign Multiple Permissions (Skip Existing)
export const assignMultiplePermissionsToRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissionIds } = req.body;
    const user = req.user;

    logger.info(`Attempting to assign multiple permissions to role ID: ${id}`, {
      userId: user?.id,
      username: user?.username,
      roleId: id,
      permissionCount: permissionIds?.length,
      permissionIds: permissionIds,
    });

    if (!Array.isArray(permissionIds) || permissionIds.length === 0) {
      logger.warn(
        `Multiple permission assignment failed: Invalid permissionIds array`,
        {
          userId: user?.id,
          roleId: id,
          providedValue: permissionIds,
        }
      );
      return res
        .status(400)
        .json({ error: "permissionIds must be a non-empty array" });
    }

    const role = await Role.findByPk(id);
    if (!role) {
      logger.warn(
        `Multiple permission assignment failed: Role not found (ID: ${id})`,
        {
          userId: user?.id,
          requestedRoleId: id,
        }
      );
      return res.status(404).json({ error: "Role not found" });
    }

    // Tambah tanpa hapus yang lama
    await role.addPermissions(permissionIds);

    logger.info(
      `Multiple permissions assigned successfully to role "${role.name}"`,
      {
        userId: user?.id,
        username: user?.username,
        roleId: id,
        roleName: role.name,
        assignedCount: permissionIds.length,
        permissionIds: permissionIds,
      }
    );

    res.json({
      message: "Permissions assigned successfully",
      count: permissionIds.length,
    });
  } catch (error) {
    logger.error(`Error assigning multiple permissions: ${error.message}`, {
      stack: error.stack,
      roleId: req.params.id,
      permissionIds: req.body.permissionIds,
      userId: req.user?.id,
    });
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Remove Permission from Role
export const removePermissionFromRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissionId } = req.body;
    const user = req.user;

    logger.info(
      `Attempting to remove permission ID: ${permissionId} from role ID: ${id}`,
      {
        userId: user?.id,
        username: user?.username,
        roleId: id,
        permissionId: permissionId,
      }
    );

    const role = await Role.findByPk(id);
    if (!role) {
      logger.warn(`Permission removal failed: Role not found (ID: ${id})`, {
        userId: user?.id,
        requestedRoleId: id,
      });
      return res.status(404).json({ error: "Role not found" });
    }

    const permission = await Permission.findByPk(permissionId);
    if (!permission) {
      logger.warn(
        `Permission removal failed: Permission not found (ID: ${permissionId})`,
        {
          userId: user?.id,
          requestedPermissionId: permissionId,
        }
      );
      return res.status(404).json({ error: "Permission not found" });
    }

    const deleted = await RolePermission.destroy({
      where: { roleId: id, permissionId },
    });

    if (!deleted) {
      logger.warn(
        `Permission removal failed: Association not found (Role: ${id}, Permission: ${permissionId})`,
        {
          userId: user?.id,
          roleId: id,
          permissionId: permissionId,
        }
      );
      return res
        .status(404)
        .json({ error: "Permission not found on this role" });
    }

    logger.info(
      `Permission removed successfully: "${permission.name}" from role "${role.name}"`,
      {
        userId: user?.id,
        username: user?.username,
        roleId: id,
        roleName: role.name,
        permissionId: permissionId,
        permissionName: permission.name,
      }
    );

    res.json({ message: "Permission removed successfully" });
  } catch (error) {
    logger.error(`Error removing permission: ${error.message}`, {
      stack: error.stack,
      roleId: req.params.id,
      permissionId: req.body.permissionId,
      userId: req.user?.id,
    });
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Remove Multiple Permissions
export const removeMultiplePermissionsFromRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissionIds } = req.body;
    const user = req.user;

    logger.info(
      `Attempting to remove multiple permissions from role ID: ${id}`,
      {
        userId: user?.id,
        username: user?.username,
        roleId: id,
        permissionCount: permissionIds?.length,
        permissionIds: permissionIds,
      }
    );

    if (!Array.isArray(permissionIds) || permissionIds.length === 0) {
      logger.warn(
        `Multiple permission removal failed: Invalid permissionIds array`,
        {
          userId: user?.id,
          roleId: id,
          providedValue: permissionIds,
        }
      );
      return res
        .status(400)
        .json({ error: "permissionIds must be a non-empty array" });
    }

    const role = await Role.findByPk(id);
    if (!role) {
      logger.warn(
        `Multiple permission removal failed: Role not found (ID: ${id})`,
        {
          userId: user?.id,
          requestedRoleId: id,
        }
      );
      return res.status(404).json({ error: "Role not found" });
    }

    await role.removePermissions(permissionIds);

    logger.info(
      `Multiple permissions removed successfully from role "${role.name}"`,
      {
        userId: user?.id,
        username: user?.username,
        roleId: id,
        roleName: role.name,
        removedCount: permissionIds.length,
        permissionIds: permissionIds,
      }
    );

    res.json({
      message: "Permissions removed successfully",
      removed: permissionIds.length,
    });
  } catch (error) {
    logger.error(`Error removing multiple permissions: ${error.message}`, {
      stack: error.stack,
      roleId: req.params.id,
      permissionIds: req.body.permissionIds,
      userId: req.user?.id,
    });
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Get Permissions for a Role (cleaner version)
export const getPermissionsForRole = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    logger.info(`Request to fetch permissions for role ID: ${id}`, {
      userId: user?.id,
      username: user?.username,
      roleId: id,
    });

    const role = await Role.findByPk(id, {
      include: {
        model: Permission,
        through: { attributes: [] }, // hide pivot table
      },
    });

    if (!role) {
      logger.warn(`Fetch role permissions failed: Role not found (ID: ${id})`, {
        userId: user?.id,
        requestedRoleId: id,
      });
      return res.status(404).json({ error: "Role not found" });
    }

    const permissions = await role.getPermissions();

    logger.info(
      `Successfully fetched ${permissions.length} permissions for role "${role.name}"`,
      {
        userId: user?.id,
        roleId: id,
        roleName: role.name,
        permissionCount: permissions.length,
      }
    );

    res.json(role.Permissions);
  } catch (error) {
    logger.error(`Error fetching role permissions: ${error.message}`, {
      stack: error.stack,
      roleId: req.params.id,
      userId: req.user?.id,
    });
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Replace All Permissions for Role
export const replacePermissionsForRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissionIds } = req.body;
    const user = req.user;

    logger.info(`Attempting to replace all permissions for role ID: ${id}`, {
      userId: user?.id,
      username: user?.username,
      roleId: id,
      permissionCount: permissionIds?.length,
      permissionIds: permissionIds,
    });

    if (!Array.isArray(permissionIds)) {
      logger.warn(
        `Permission replacement failed: Invalid permissionIds array`,
        {
          userId: user?.id,
          roleId: id,
          providedValue: permissionIds,
        }
      );
      return res.status(400).json({ error: "permissionIds must be an array" });
    }

    const role = await Role.findByPk(id);
    if (!role) {
      logger.warn(`Permission replacement failed: Role not found (ID: ${id})`, {
        userId: user?.id,
        requestedRoleId: id,
      });
      return res.status(404).json({ error: "Role not found" });
    }

    // Get existing permissions for comparison
    const oldPermissions = await role.getPermissions();
    const oldPermissionIds = oldPermissions.map((p) => p.id);

    // Replace with new permissions (Sequelize handles deletion + insertion)
    await role.setPermissions(permissionIds);

    logger.info(`Permissions replaced successfully for role "${role.name}"`, {
      userId: user?.id,
      username: user?.username,
      roleId: id,
      roleName: role.name,
      changes: {
        from: oldPermissionIds,
        to: permissionIds,
      },
    });

    res.json({ message: "Permissions replaced successfully" });
  } catch (error) {
    logger.error(`Error replacing permissions: ${error.message}`, {
      stack: error.stack,
      roleId: req.params.id,
      permissionIds: req.body.permissionIds,
      userId: req.user?.id,
    });
    res.status(500).json({ error: "Internal Server Error" });
  }
};
