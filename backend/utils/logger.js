import winston from "winston";
import moment from "moment-timezone";
import fs from "fs";
import path from "path";
import Transport from "winston-transport";
import { Log } from "../models/index.js";

const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    req: 2,
    info: 3,
    debug: 4,
  },
  colors: {
    error: "red",
    warn: "yellow",
    req: "cyan",
    info: "green",
    debug: "blue",
  },
};

winston.addColors(customLevels.colors);

const logDir = "logs";
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const timestampFormat = winston.format((info) => {
  info.timestamp = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");
  return info;
});

const jsonWithTimestamp = winston.format.combine(
  timestampFormat(),
  winston.format.json()
);
class SequelizeTransport extends Transport {
  log(info, callback) {
    setImmediate(() => {
      this.emit("logged", info);
    });

    Log.create({
      level: info.level,
      message: info.message,
      timestamp:
        info.timestamp ||
        moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
      meta: info.meta || null,
    }).catch((err) => {
      console.error("Failed to log to DB:", err);
    });

    callback();
  }
}

const logger = winston.createLogger({
  levels: customLevels.levels,
  level: "debug",
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({
          format: () =>
            moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"),
        }),
        winston.format.printf(({ timestamp, level, message }) => {
          // Apply colorization only to the level part
          const colorizedLevel = winston.format
            .colorize()
            .colorize(level, level.toUpperCase());
          return `[${timestamp}] [${colorizedLevel}]: ${message}`;
        })
      ),
    }),

    new SequelizeTransport({
      level: "info", // atur sesuai kebutuhan
    }),

    // Pisah berdasarkan level
    new winston.transports.File({
      filename: path.join(logDir, "info.log"),
      level: "info",
      format: jsonWithTimestamp,
    }),
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
      format: jsonWithTimestamp,
    }),
    new winston.transports.File({
      filename: path.join(logDir, "warn.log"),
      level: "warn",
      format: jsonWithTimestamp,
    }),
    new winston.transports.File({
      filename: path.join(logDir, "req.log"),
      level: "req",
      format: jsonWithTimestamp,
    }),
    new winston.transports.File({
      filename: path.join(logDir, "debug.log"),
      level: "debug",
      format: jsonWithTimestamp,
    }),
  ],
});

export default logger;
