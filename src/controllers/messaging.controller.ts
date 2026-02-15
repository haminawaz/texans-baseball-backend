import { Request, Response } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import messagingQueries from "../queries/messaging";
import { MessageSenderType } from "../generated/prisma";
import { emitToThread } from "../services/socket.service";

export const getThreads = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.decoded.userId as number;
  const role = req.decoded.permissionLevel ? "coach" : "player";

  const threads = await messagingQueries.getThreads(
    userId,
    role as "coach" | "player",
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
  const userId = req.decoded.userId as number;
  const role = req.decoded.permissionLevel ? "coach" : "player";

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

  const messages = await messagingQueries.getMessages(
    parseInt(threadId),
    limit,
    skip,
  );
  emitToThread(threadId, "user_entered_chat", { userId, role });

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

export const createThread = asyncHandler(
  async (req: Request, res: Response) => {
    const { type, team_id, coaches = [], players = [] } = req.body;
    const userId = req.decoded.userId as number;
    const role = req.decoded.permissionLevel ? "coach" : "player";

    try {
      await messagingQueries.validateThreadParticipants(
        userId,
        role,
        type,
        team_id,
        coaches,
        players,
      );

      let updatedCoaches = [...coaches];
      let updatedPlayers = [...players];

      if (role === "coach") {
        if (!updatedCoaches.includes(userId)) updatedCoaches.push(userId);
      } else {
        if (!updatedPlayers.includes(userId)) updatedPlayers.push(userId);
      }

      const thread = await messagingQueries.createThread(
        type,
        team_id,
        updatedCoaches,
        updatedPlayers,
      );

      return res.status(201).json({
        message: "Thread created successfully",
        response: { data: thread },
        error: null,
      });
    } catch (error: any) {
      return res.status(400).json({
        message: error.message || "Failed to create thread",
        response: null,
        error: error.message,
      });
    }
  },
);

export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.decoded.userId as number;
  const { thread_id, message } = req.body;
  const role = req.decoded.permissionLevel ? "coach" : "player";

  try {
    await messagingQueries.checkThreadAccess(thread_id, userId, role);
    const senderType =
      role === "coach" ? MessageSenderType.coach : MessageSenderType.player;

    const messages = await messagingQueries.sendMessage({
      thread_id,
      sender_type: senderType,
      coach_id: role === "coach" ? userId : undefined,
      player_id: role === "player" ? userId : undefined,
      content: message,
    });
    emitToThread(thread_id, "new_message", messages);

    return res.status(201).json({
      message: "Message sent successfully",
      response: {
        data: messages,
      },
      error: null,
    });
  } catch (error: any) {
    const statusCode = error.message === "Thread not found" ? 404 : 403;
    return res.status(statusCode).json({
      message: error.message || "Failed to send message",
      response: null,
      error: error.message,
    });
  }
});

export const addReaction = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.decoded.userId as number;
  const { message_id, emoji } = req.body;
  const role = req.decoded.permissionLevel ? "coach" : "player";
  const senderType =
    role === "coach" ? MessageSenderType.coach : MessageSenderType.player;

  try {
    const message = await messagingQueries.getMessageWithThread(message_id);
    if (!message) {
      return res.status(404).json({
        message: "Message not found",
        response: null,
        error: "Message not found",
      });
    }
    await messagingQueries.checkThreadAccess(message.thread_id, userId, role);

    const reaction = await messagingQueries.addReaction({
      message_id,
      emoji,
      sender_type: senderType,
      coach_id: role === "coach" ? userId : undefined,
      player_id: role === "player" ? userId : undefined,
    });
    emitToThread((reaction as any).message.thread_id, "new_reaction", reaction);

    return res.status(201).json({
      message: "Reaction added successfully",
      response: null,
      error: null,
    });
  } catch (error: any) {
    const statusCode = error.message === "Thread not found" ? 404 : 403;
    return res.status(statusCode).json({
      message: error.message || "Failed to add reaction",
      response: null,
      error: error.message,
    });
  }
});

export const removeReaction = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.decoded.userId as number;
    const { reactionId } = req.params;
    const role = req.decoded.permissionLevel ? "coach" : "player";

    try {
      const reaction = await messagingQueries.getReaction(parseInt(reactionId));
      if (!reaction) {
        return res.status(404).json({
          message: "Reaction not found",
          response: null,
          error: "Reaction not found",
        });
      }
      const isOwner =
        role === "coach"
          ? reaction.coach_id === userId
          : reaction.player_id === userId;
      if (!isOwner) {
        return res.status(404).json({
          message: "Reaction not found",
          response: null,
          error: "Reaction not found",
        });
      }

      await messagingQueries.removeReaction(parseInt(reactionId));
      emitToThread(reaction.message.thread_id, "reaction_removed", {
        reactionId,
      });

      return res.status(200).json({
        message: "Reaction removed successfully",
        response: null,
        error: null,
      });
    } catch (error: any) {
      const statusCode = error.message === "Thread not found" ? 404 : 403;
      return res.status(statusCode).json({
        message: error.message || "Failed to remove reaction",
        response: null,
        error: error.message,
      });
    }
  },
);

export const deleteMessage = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.decoded.userId as number;
    const { messageId } = req.params;
    const role = req.decoded.permissionLevel ? "coach" : "player";

    try {
      const message = await messagingQueries.getMessage(parseInt(messageId));
      if (!message) {
        return res.status(404).json({
          message: "Message not found",
          response: null,
          error: "Message not found",
        });
      }
      const isOwner =
        role === "coach"
          ? message.coach_id === userId
          : message.player_id === userId;
      if (!isOwner) {
        return res.status(404).json({
          message: "Message not found",
          response: null,
          error: "Message not found",
        });
      }

      await messagingQueries.removeMessage(parseInt(messageId));
      emitToThread(message.thread_id, "message_removed", { messageId });

      return res.status(200).json({
        message: "Message removed successfully",
        response: null,
        error: null,
      });
    } catch (error: any) {
      const statusCode = error.message === "Thread not found" ? 404 : 403;
      return res.status(statusCode).json({
        message: error.message || "Failed to remove message",
        response: null,
        error: error.message,
      });
    }
  },
);

export const deleteThread = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.decoded.userId as number;
    const { threadId } = req.params;
    const role = req.decoded.permissionLevel ? "coach" : "player";

    try {
      const thread = await messagingQueries.getThread(parseInt(threadId));
      if (!thread) {
        return res.status(404).json({
          message: "Thread not found",
          response: null,
          error: "Thread not found",
        });
      }

      await messagingQueries.checkThreadAccess(
        parseInt(threadId),
        userId,
        role,
      );
      await messagingQueries.removeThread(parseInt(threadId));
      emitToThread(threadId, "thread_deleted", { threadId });

      return res.status(200).json({
        message: "Thread deleted successfully",
        response: null,
        error: null,
      });
    } catch (error: any) {
      const statusCode = error.message === "Thread not found" ? 404 : 403;
      return res.status(statusCode).json({
        message: error.message || "Failed to delete thread",
        response: null,
        error: error.message,
      });
    }
  },
);
