import { Request, Response } from "express";
import { asyncHandler } from "../../middleware/errorHandler";
import coachUniformSizingQueries from "../../queries/coach/uniform-sizing";
import uniformSizingQueries from "../../queries/admin/uniform-sizing";

export const getUniformSizing = asyncHandler(
  async (req: Request, res: Response) => {
    const coachId = req.decoded.userId as number;

    const sizing = await coachUniformSizingQueries.getUniformSizing(coachId);

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
    const coachId = req.decoded.userId as number;
    const updateData = req.body;

    const updatedSizing = await coachUniformSizingQueries.updateUniformSizing({
      coach_id: coachId,
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

export const getAllPlayersUniformSizing = asyncHandler(
  async (req: Request, res: Response) => {
    const name = req.query.name as string;
    const teamId = req.query.teamId
      ? parseInt(req.query.teamId as string)
      : undefined;

    const playersSizing = await uniformSizingQueries.getAllPlayersUniformSizing(
      name,
      teamId,
    );

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

    if (req.decoded.permissionLevel === "read_only") {
      return res.status(403).json({
        message: "You do not have permission to update player uniform sizing",
        response: null,
        error: "You do not have permission to update player uniform sizing",
      });
    }

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
