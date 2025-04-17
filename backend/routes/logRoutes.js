import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOG_DIR = path.join(__dirname, "../logs");

router.get("/:level", (req, res) => {
  const { level } = req.params;
  const filePath = path.join(LOG_DIR, `${level}.log`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "Log file not found" });
  }

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Failed to read log file:", err);
      return res.status(500).json({ message: "Failed to read log file" });
    }

    const logs = data
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    res.json(logs);
  });
});

export default router;
