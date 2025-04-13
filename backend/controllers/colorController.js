import { Color } from "../models/index.js";
import logger from "../utils/logger.js";

// ✅ Add Color
export const createColor = async (req, res) => {
  try {
    const { color_code, fabric_type, color } = req.body;
    const user = req.user;

    if (!color || !color_code || !fabric_type) {
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

    logger.info(`Color created: ${color}, by User: ${user.username}`);
    res.status(201).json({ message: "Color created", colorAdd });
  } catch (error) {
    logger.error("Error creating color:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Get All Colors
export const getColors = async (req, res) => {
  try {
    const colors = await Color.findAll();
    res.json(colors);
  } catch (error) {
    logger.error("Error fetching colors:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ❌ Delete Color by ID
export const deleteColor = async (req, res) => {
  try {
    const { color_code } = req.params;

    const deleted = await Color.destroy({
      where: { color_code },
    });

    if (!deleted) {
      return res.status(404).json({ error: "Color not found" });
    }

    logger.info(`Color with ID ${color_code} deleted`);
    res.json({ message: "Color deleted successfully" });
  } catch (error) {
    logger.error("Error deleting color:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// 🔄 Edit/Update Color by color_code
export const updateColor = async (req, res) => {
  try {
    const { color_code } = req.params;
    const { fabric_type, color } = req.body;

    if (!color || !fabric_type) {
      return res
        .status(400)
        .json({ error: "color and fabric_type are required" });
    }

    // Pakai findOne kalau color_code bukan primary key
    const colorToUpdate = await Color.findOne({ where: { color_code } });

    if (!colorToUpdate) {
      return res.status(404).json({ error: "Color not found" });
    }

    await colorToUpdate.update({ fabric_type, color });

    logger.info(`Color with code ${color_code} updated`);
    res.json({
      message: "Color updated successfully",
      updatedColor: colorToUpdate,
    });
  } catch (error) {
    logger.error("Error updating color:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
