import { User, Role } from "../models/index.js";
import logger from "../utils/logger.js";

// ✅ Get all users
export const getUsers = async (req, res) => {
  try {
    const user = req.user;

    logger.info(`Request to fetch all users`, {
      userId: user?.id,
      username: user?.username,
    });

    const users = await User.findAll();

    logger.info(`Successfully fetched ${users.length} users`, {
      userId: user?.id,
      count: users.length,
    });

    res.json(users);
  } catch (error) {
    logger.error(`Error fetching users: ${error.message}`, {
      stack: error.stack,
      userId: req.user?.id,
    });
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Get user profile
export const profile = async (req, res) => {
  const user = req.user;

  if (!user) {
    logger.warn(`Profile access attempt without authentication`, {
      ip: req.ip,
      headers: req.headers["user-agent"],
    });
    return res.status(401).json({ error: "Unauthorized" });
  }

  logger.info(`Profile request for user: ${user.username}`, {
    userId: user.id,
    username: user.username,
  });

  try {
    const userProfile = await User.findOne({
      where: { id: user.id },
      attributes: ["id", "username", "roleId"],
      include: {
        model: Role,
        attributes: ["name"],
      },
    });

    if (!userProfile) {
      logger.warn(`Profile not found for authenticated user ID: ${user.id}`, {
        userId: user.id,
        username: user.username,
      });
      return res.status(404).json({ error: "User not found" });
    }

    logger.info(`Profile successfully retrieved for user: ${user.username}`, {
      userId: user.id,
      username: user.username,
      roleId: userProfile.roleId,
      roleName: userProfile.Role?.name,
    });

    res.json({
      user: {
        id: userProfile.id,
        username: userProfile.username,
        roleId: userProfile.roleId,
        roleName: userProfile.Role.name,
      },
    });
  } catch (error) {
    logger.error(`Error retrieving user profile: ${error.message}`, {
      stack: error.stack,
      userId: user.id,
      username: user.username,
    });
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Create user (register manual)
export const createUser = async (req, res) => {
  try {
    const { username, password, roleId } = req.body;
    const user = req.user;

    logger.info(`User creation attempt: ${username} with role ID: ${roleId}`, {
      userId: user?.id,
      username: user?.username,
      newUsername: username,
      roleId: roleId,
    });

    if (!username || !password || !roleId) {
      logger.warn(`User creation failed: Missing required fields`, {
        userId: user?.id,
        provided: {
          username: !!username,
          password: !!password,
          roleId: !!roleId,
        },
      });
      return res
        .status(400)
        .json({ error: "Username, password, and roleId are required" });
    }

    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      logger.warn(
        `User creation failed: Username already exists: ${username}`,
        {
          userId: user?.id,
          existingUserId: existingUser.id,
        }
      );
      return res.status(409).json({ error: "Username already exists" });
    }

    const newUser = await User.create({
      username,
      password,
      roleId,
      is_active: true,
    });

    logger.info(
      `User created successfully: ${username} (ID: ${newUser.id}) with role ID: ${roleId}`,
      {
        userId: user?.id,
        createdBy: user?.username,
        newUserId: newUser.id,
        newUsername: username,
        roleId: roleId,
      }
    );

    res.status(201).json({
      message: "User created",
      user: {
        id: newUser.id,
        username: newUser.username,
        roleId: newUser.roleId,
        is_active: newUser.is_active,
      },
    });
  } catch (error) {
    logger.error(`Error creating user: ${error.message}`, {
      stack: error.stack,
      requestBody: req.body,
      userId: req.user?.id,
    });
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Update user (ganti email, username, role, aktif/nonaktif)
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, roleId, is_active } = req.body;
    const user = req.user;

    logger.info(`User update attempt for ID: ${id}`, {
      userId: user?.id,
      username: user?.username,
      targetUserId: id,
      updateData: { username, roleId, is_active },
    });

    const targetUser = await User.findByPk(id);
    if (!targetUser) {
      logger.warn(`User update failed: User not found (ID: ${id})`, {
        userId: user?.id,
        requestedId: id,
      });
      return res.status(404).json({ error: "User not found" });
    }

    const oldValues = {
      username: targetUser.username,
      roleId: targetUser.roleId,
      is_active: targetUser.is_active,
    };

    await targetUser.update({
      username: username ?? targetUser.username,
      roleId: roleId ?? targetUser.roleId,
      is_active: is_active !== undefined ? is_active : targetUser.is_active,
    });

    logger.info(
      `User updated successfully: ${targetUser.username} (ID: ${id})`,
      {
        userId: user?.id,
        username: user?.username,
        targetUserId: id,
        changes: {
          from: oldValues,
          to: {
            username: targetUser.username,
            roleId: targetUser.roleId,
            is_active: targetUser.is_active,
          },
        },
      }
    );

    res.json({
      message: "User updated",
      user: {
        id: targetUser.id,
        username: targetUser.username,
        roleId: targetUser.roleId,
        is_active: targetUser.is_active,
      },
    });
  } catch (error) {
    logger.error(`Error updating user: ${error.message}`, {
      stack: error.stack,
      userId: req.user?.id,
      targetUserId: req.params.id,
      requestBody: req.body,
    });
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Soft delete user (nonaktifin)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    logger.info(`User deactivation attempt for ID: ${id}`, {
      userId: user?.id,
      username: user?.username,
      targetUserId: id,
    });

    const targetUser = await User.findByPk(id);
    if (!targetUser) {
      logger.warn(`User deactivation failed: User not found (ID: ${id})`, {
        userId: user?.id,
        requestedId: id,
      });
      return res.status(404).json({ error: "User not found" });
    }

    // Check if trying to deactivate self
    if (user.id === targetUser.id) {
      logger.warn(
        `User deactivation failed: Attempt to deactivate self (ID: ${id})`,
        {
          userId: user?.id,
          username: user?.username,
        }
      );
      return res
        .status(400)
        .json({ error: "Cannot deactivate your own account" });
    }

    await targetUser.update({ is_active: false });

    logger.info(
      `User deactivated successfully: ${targetUser.username} (ID: ${id})`,
      {
        userId: user?.id,
        username: user?.username,
        targetUserId: id,
        targetUsername: targetUser.username,
      }
    );

    res.json({ message: "User deactivated" });
  } catch (error) {
    logger.error(`Error deactivating user: ${error.message}`, {
      stack: error.stack,
      userId: req.user?.id,
      targetUserId: req.params.id,
    });
    res.status(500).json({ error: "Internal Server Error" });
  }
};
