import { Request, Response, NextFunction } from "express";
import parentQueries from "../queries/parent/parent";

export const verifyParentPlayerLink = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parentId = req.decoded.userId;
    if (!parentId) {
      return res.status(401).json({
        message: "Parent authentication required",
        response: null,
        error: "Parent authentication required",
      });
    }

    const playerId = parseInt(req.params.playerId);
    if (!playerId) {
      return res.status(400).json({
        message: "Player ID is required",
        response: null,
        error: "Player ID is required",
      });
    }

    const link = await parentQueries.getParentLink(playerId, parentId);
    if (!link) {
      return res.status(403).json({
        message: "Access denied. You are not linked to this player",
        response: null,
        error: "Access denied. You are not linked to this player",
      });
    }

    req.playerId = playerId;
    return next();
  } catch (error: any) {
    return res.status(500).json({
      message: "Internal server error",
      response: null,
      error: error.message,
    });
  }
};
