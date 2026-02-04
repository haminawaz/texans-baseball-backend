import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";
import fs from "fs";

const isVercel = process.env.VERCEL === "1";
const logDir = path.join(process.cwd(), "logs");

if (!isVercel && !fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length) {
      log += ` ${JSON.stringify(meta)}`;
    }
    return log;
  })
);

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: process.env.NODE_ENV === "production" ? fileFormat : consoleFormat,
  }),
];

if (!isVercel) {
  transports.push(
    new DailyRotateFile({
      dirname: logDir,
      filename: "error-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      level: "error",
      maxFiles: "3d",
      format: fileFormat,
    }),
    new DailyRotateFile({
      dirname: logDir,
      filename: "combined-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxFiles: "3d",
      format: fileFormat,
    })
  );
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  defaultMeta: {
    service: "texans-baseball-backend",
  },
  exitOnError: false,
  transports,
});

export default logger;
