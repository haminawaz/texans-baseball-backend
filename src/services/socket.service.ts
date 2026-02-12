import { Server as SocketIOServer } from "socket.io";
import { Server as HttpServer } from "http";
import logger from "./logger.service";

let io: SocketIOServer;

export const initSocket = (server: HttpServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    logger.info(`User connected: ${socket.id}`);

    socket.on("join_thread", (threadId: string) => {
      socket.join(`thread_${threadId}`);
      logger.info(`Socket ${socket.id} joined thread: ${threadId}`);
    });

    socket.on("leave_thread", (threadId: string) => {
      socket.leave(`thread_${threadId}`);
      logger.info(`Socket ${socket.id} left thread: ${threadId}`);
    });

    socket.on("disconnect", () => {
      logger.info(`User disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

export const emitToThread = (
  threadId: number | string,
  event: string,
  data: any,
) => {
  if (io) {
    io.to(`thread_${threadId}`).emit(event, data);
  }
};
