import { Request, Response } from "express";
import { asyncHandler } from "../../middleware/errorHandler";
import messagingQueries from "../../queries/messaging";

export const getThreads = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit =
    parseInt((req.query.pageSize || req.query.limit) as string) || 20;
  const skip = (page - 1) * limit;
  const threads = await messagingQueries.getAllThreads(limit, skip);

  return res.status(200).json({
    message: "Threads fetched successfully",
    response: {
      data: threads,
      pagination: {
        page,
        limit,
        count: threads.length,
      },
    },
    error: null,
  });
});

export const getMessages = asyncHandler(async (req: Request, res: Response) => {
  const { threadId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit =
    parseInt((req.query.pageSize || req.query.limit) as string) || 50;
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

export const deleteThread = asyncHandler(
  async (req: Request, res: Response) => {
    const { threadId } = req.params;

    try {
      const thread = await messagingQueries.getThread(parseInt(threadId));
      if (!thread) {
        return res.status(404).json({
          message: "Thread not found",
          response: null,
          error: "Thread not found",
        });
      }
      await messagingQueries.removeThread(parseInt(threadId));

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
