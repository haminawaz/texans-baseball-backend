import { Request } from "express";
import morgan from "morgan";
import logger from "../services/logger.service";

morgan.token("id", (req: Request) => req.id || "-");

const morganFormat =
  process.env.NODE_ENV === "production"
    ? ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"'
    : "dev";

const stream: morgan.StreamOptions = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

const requestLogger = morgan(morganFormat, {
  stream,
  skip: (req: Request) => {
    return process.env.NODE_ENV === "production" && req.url === "/health";
  },
});

export default requestLogger;
