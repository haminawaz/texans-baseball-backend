import http from "http";
import app from "./app";
import config from "./config/env";
import logger from "./services/logger.service";
import connectDB from "./config/database";
import { initSocket } from "./services/socket.service";

connectDB();
let server: any;
let httpServer: http.Server;

const startServer = () => {
  httpServer = http.createServer(app);
  initSocket(httpServer);

  server = httpServer.listen(config.port, () => {
    logger.info(
      `Server running in ${config.nodeEnv} mode on port ${config.port}`,
    );
  });
};

if (process.env.NODE_ENV !== "production") {
  startServer();
}

export default app;

process.on("unhandledRejection", (err: Error) => {
  logger.error("UNHANDLED REJECTION! Shutting down...");
  logger.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on("uncaughtException", (err: Error) => {
  logger.error("UNCAUGHT EXCEPTION! Shutting down...");
  logger.error(err.name, err.message);
  process.exit(1);
});

process.on("SIGTERM", () => {
  logger.info("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    logger.info("Process terminated!");
  });
});
