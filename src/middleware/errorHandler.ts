import { Request, Response, NextFunction } from "express";
import logger from "../services/logger.service";

export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

interface ExpressError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
}

export const errorHandler = (
  err: ExpressError,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response | void => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    logger.error("Error:", {
      message: err.message,
      stack: err.stack,
      statusCode: err.statusCode,
    });

    return res.status(err.statusCode).json({
      message: err.message,
      response: null,
      error: err.message,
    });
  }

  if (err.isOperational) {
    logger.error("Operational Error:", {
      message: err.message,
      statusCode: err.statusCode,
    });

    return res.status(err.statusCode).json({
      message: err.message,
      response: null,
      error: err.message,
    });
  }

  logger.error("Programming Error:", {
    message: err.message,
    stack: err.stack,
  });

  return res.status(500).json({
    message: "Something went wrong!",
    response: null,
    error: "Something went wrong!",
  });
};

export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const err = new AppError(`Route not found: ${req.originalUrl}`, 404);
  next(err);
};

type AsyncFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<Response | void>;

export const asyncHandler = (fn: AsyncFunction) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
