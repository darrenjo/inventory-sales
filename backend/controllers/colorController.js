import Color from "../models/color.js";
import winston from "../utils/logger.js";

// ✅ Tambah Color Baru
export const createColor = async (req, res) => {
  try {
    const { color_code, fabric_type, color } = req.body;
    const user = req.user; // Ambil data user dari middleware autentikasi

    const colorAdd = await Color.create({
      color_code,
      fabric_type,
      color,
      by_who: user.id,
    });

    winston.info(`Color created: ${color}, by User: ${user.username}`);
    res.status(201).json({ message: "Color created", colorAdd });
  } catch (error) {
    winston.error("Error creating color:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Lihat Semua Color
export const getColors = async (req, res) => {
  try {
    const colors = await Color.findAll();
    res.json(colors);
  } catch (error) {
    winston.error("Error fetching colors:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
