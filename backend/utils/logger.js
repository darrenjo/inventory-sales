import winston from "winston";
import moment from "moment-timezone";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.printf(({ level, message }) => {
      return `${moment()
        .tz("Asia/Jakarta")
        .format("YYYY-MM-DD HH:mm:ss")} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    // new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    // new winston.transports.File({ filename: 'logs/requests.log' }) // Log request ke file terpisah
  ],
});

export default logger;
