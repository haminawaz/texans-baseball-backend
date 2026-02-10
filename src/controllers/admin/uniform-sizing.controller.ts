import { Request, Response } from "express";
import { asyncHandler } from "../../middleware/errorHandler";
import uniformSizingQueries from "../../queries/admin/uniform-sizing";

export const getAllPlayersUniformSizing = asyncHandler(
  async (req: Request, res: Response) => {
    const name = req.query.name as string;
    const teamId = req.query.teamId
      ? parseInt(req.query.teamId as string)
      : undefined;

    const playersSizing =
      await uniformSizingQueries.getAllPlayersUniformSizing(name, teamId);

    return res.status(200).json({
      message: "Players uniform sizing fetched successfully",
      response: {
        data: playersSizing,
      },
      error: null,
    });
  },
);

export const updatePlayerUniformSizing = asyncHandler(
  async (req: Request, res: Response) => {
    const playerId = parseInt(req.params.id);
    const updateData = req.body;
    updateData.player_id = playerId;

    const updatedSizing =
      await uniformSizingQueries.updatePlayerUniformSizing(updateData);
    if (!updatedSizing) {
      return res.status(404).json({
        message: "Failed to update player uniform sizing",
        response: null,
        error: "Failed to update player uniform sizing",
      });
    }

    return res.status(200).json({
      message: "Player uniform sizing updated successfully",
      response: null,
      error: null,
    });
  },
);
