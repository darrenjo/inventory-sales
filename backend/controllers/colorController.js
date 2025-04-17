import { Color } from "../models/index.js";
import logger from "../utils/logger.js";

// ✅ Add Color
export const createColor = async (req, res) => {
  try {
    const { color_code, fabric_type, color } = req.body;
    const user = req.user;

    logger.info(
      `Color creation attempt: ${color} (${color_code}) for ${fabric_type}`,
      {
        userId: user.id,
        username: user.username,
        colorData: { color_code, fabric_type, color },
      }
    );

    if (!color || !color_code || !fabric_type) {
      logger.warn(`Color creation failed: Missing required fields`, {
        userId: user.id,
        provided: {
          color: !!color,
          color_code: !!color_code,
          fabric_type: !!fabric_type,
        },
      });
      return res.status(400).json({
        error: "color, color_code, and fabric_type are required",
      });
    }

    // check combination fabric_type and color exist
    const existingColor = await Color.findOne({
      where: {
        fabric_type,
        color,
      },
    });

    if (existingColor) {
      logger.warn(`Color creation failed: Duplicate color for fabric type`, {
        userId: user.id,
        fabricType: fabric_type,
        color: color,
        existingColorCode: existingColor.color_code,
      });
      return res.status(400).json({
        error: `Color "${color}" already exists for fabric type "${fabric_type}"`,
      });
    }

    const colorAdd = await Color.create({
      color_code,
      fabric_type,
      color,
      by_who: user.id,
    });

    logger.info(
      `Color created successfully: ${color} (${color_code}) for ${fabric_type}`,
      {
        userId: user.id,
        username: user.username,
        colorId: colorAdd.id,
        colorDetails: { color_code, fabric_type, color },
      }
    );
    res.status(201).json({ message: "Color created", colorAdd });
  } catch (error) {
    logger.error(`Error creating color: ${error.message}`, {
      stack: error.stack,
      requestBody: req.body,
      userId: req.user?.id,
    });
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Get All Colors
export const getColors = async (req, res) => {
  try {
    logger.info(`Request to fetch all colors`);

    const colors = await Color.findAll();

    logger.info(`Successfully fetched ${colors.length} colors`);
    res.json(colors);
  } catch (error) {
    logger.error(`Error fetching colors: ${error.message}`, {
      stack: error.stack,
    });
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ❌ Delete Color by ID
export const deleteColor = async (req, res) => {
  try {
    const { color_code } = req.params;
    const user = req.user;

    logger.info(`Color deletion attempt for code: ${color_code}`, {
      userId: user?.id,
      username: user?.username,
    });

    const colorToDelete = await Color.findOne({ where: { color_code } });
    if (!colorToDelete) {
      logger.warn(
        `Color deletion failed: Color not found (code: ${color_code})`,
        {
          userId: user?.id,
        }
      );
      return res.status(404).json({ error: "Color not found" });
    }

    const deleted = await Color.destroy({
      where: { color_code },
    });

    if (!deleted) {
      logger.warn(
        `Color deletion failed: Delete operation returned ${deleted}`,
        {
          userId: user?.id,
          colorCode: color_code,
        }
      );
      return res.status(404).json({ error: "Color not found" });
    }

    logger.info(
      `Color deleted successfully: ${colorToDelete.color} (${color_code})`,
      {
        userId: user?.id,
        username: user?.username,
        colorDetails: {
          color_code: color_code,
          fabric_type: colorToDelete.fabric_type,
          color: colorToDelete.color,
        },
      }
    );
    res.json({ message: "Color deleted successfully" });
  } catch (error) {
    logger.error(`Error deleting color: ${error.message}`, {
      stack: error.stack,
      colorCode: req.params.color_code,
      userId: req.user?.id,
    });
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// 🔄 Edit/Update Color by color_code
export const updateColor = async (req, res) => {
  try {
    const { color_code } = req.params;
    const { fabric_type, color } = req.body;
    const user = req.user;

    logger.info(`Color update attempt for code: ${color_code}`, {
      userId: user?.id,
      username: user?.username,
      updateData: { fabric_type, color },
    });

    if (!color || !fabric_type) {
      logger.warn(`Color update failed: Missing required fields`, {
        userId: user?.id,
        provided: {
          color: !!color,
          fabric_type: !!fabric_type,
        },
      });
      return res
        .status(400)
        .json({ error: "color and fabric_type are required" });
    }

    // Pakai findOne kalau color_code bukan primary key
    const colorToUpdate = await Color.findOne({ where: { color_code } });

    if (!colorToUpdate) {
      logger.warn(
        `Color update failed: Color not found (code: ${color_code})`,
        {
          userId: user?.id,
        }
      );
      return res.status(404).json({ error: "Color not found" });
    }

    const oldValues = {
      fabric_type: colorToUpdate.fabric_type,
      color: colorToUpdate.color,
    };

    await colorToUpdate.update({ fabric_type, color });

    logger.info(`Color updated successfully: ${color_code}`, {
      userId: user?.id,
      username: user?.username,
      colorCode: color_code,
      changes: {
        from: oldValues,
        to: { fabric_type, color },
      },
    });
    res.json({
      message: "Color updated successfully",
      updatedColor: colorToUpdate,
    });
  } catch (error) {
    logger.error(`Error updating color: ${error.message}`, {
      stack: error.stack,
      colorCode: req.params.color_code,
      requestBody: req.body,
      userId: req.user?.id,
    });
    res.status(500).json({ error: "Internal Server Error" });
  }
};
