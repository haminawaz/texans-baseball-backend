import { Request, Response } from "express";
import { asyncHandler } from "../../middleware/errorHandler";
import playerQueries from "../../queries/player/uniform-sizing";

export const getUniformSizing = asyncHandler(
  async (req: Request, res: Response) => {
    const playerId = req.decoded.userId as number;

    const sizing = await playerQueries.getUniformSizing(playerId);

    return res.status(200).json({
      message: "Uniform sizing fetched successfully",
      response: {
        data: sizing,
      },
      error: null,
    });
  },
);

export const updateUniformSizing = asyncHandler(
  async (req: Request, res: Response) => {
    const playerId = req.decoded.userId as number;
    const updateData = req.body;

    const updatedSizing = await playerQueries.updateUniformSizing({
      player_id: playerId,
      ...updateData,
    });
    if (!updatedSizing) {
      return res.status(400).json({
        message: "Failed to update uniform sizing",
        response: null,
        error: "Failed to update uniform sizing",
      });
    }

    return res.status(200).json({
      message: "Uniform sizing updated successfully",
      response: null,
      error: null,
    });
  },
);
