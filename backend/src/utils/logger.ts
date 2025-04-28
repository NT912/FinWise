import winston from "winston";

/**
 * Tạo một logger với tên của module
 * @param moduleName Tên module để hiển thị trong logs
 * @returns Winston logger instance
 */
export const createLogger = (moduleName: string) => {
  return winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.printf(({ timestamp, level, message }) => {
        return `[${timestamp}] [${moduleName}] ${level.toUpperCase()}: ${message}`;
      })
    ),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: "error.log", level: "error" }),
      new winston.transports.File({ filename: "combined.log" }),
    ],
  });
};
