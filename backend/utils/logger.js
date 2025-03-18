import winston from "winston";
import moment from "moment-timezone";

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

const logger = winston.createLogger({
  levels: customLevels.levels,
  level: "debug", // Set to the highest level to capture all logs
  format: winston.format.combine(
    winston.format.printf(({ level, message }) => {
      return `${moment()
        .tz("Asia/Jakarta")
        .format("YYYY-MM-DD HH:mm:ss")} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize({ all: true })),
    }),
    // new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    // new winston.transports.File({ filename: "logs/requests.log" }), // Log request ke file terpisah
  ],
});

export default logger;
