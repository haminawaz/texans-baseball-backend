import { Request, Response } from "express";
import { asyncHandler } from "../../middleware/errorHandler";
import messagingQueries from "../../queries/messaging";
import { emitToThread } from "../../services/socket.service";

export const getThreads = asyncHandler(async (req: Request, res: Response) => {
  const playerId = req.playerId as number;

  const threads = await messagingQueries.getThreads(
    playerId,
    "player",
  );

  return res.status(200).json({
    message: "Threads fetched successfully",
    response: {
      data: threads,
    },
    error: null,
  });
});

export const getMessages = asyncHandler(async (req: Request, res: Response) => {
  const { threadId } = req.params;
  const playerId = req.playerId as number;

  const limit = parseInt(req.query.pageSize as string) || 50;
  const page = parseInt(req.query.page as string) || 1;
  const skip = (page - 1) * limit;

  const thread = await messagingQueries.getThread(parseInt(threadId));
  if (!thread) {
    return res.status(404).json({
      message: "Thread not found",
      response: null,
      error: "Thread not found",
    });
  }
  await messagingQueries.checkThreadAccess(parseInt(threadId), playerId, "player");

  const messages = await messagingQueries.getMessages(
    parseInt(threadId),
    limit,
    skip,
  );
  emitToThread(threadId, "user_entered_chat", { userId: playerId, role: "player" });

  return res.status(200).json({
    message: "Messages fetched successfully",
    response: {
      data: messages,
      pagination: {
        page,
        limit,
        count: messages.length,
      },
    },
    error: null,
  });
});
