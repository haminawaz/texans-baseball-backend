import { Request, Response } from "express";
import { asyncHandler } from "../../middleware/errorHandler";
import playerQueries from "../../queries/player/auth";

export const getPlayers = asyncHandler(async (req: Request, res: Response) => {
  const name = req.query.name as string;
  const teamId = req.query.teamId
    ? parseInt(req.query.teamId as string)
    : undefined;
  const position = req.query.position as string;

  const result = await playerQueries.getAllPlayers(name, teamId, position);

  const data = {
    data: result.players,
  };

  return res.status(200).json({
    message: "Players fetched successfully",
    response: data,
    error: null,
  });
});

export const getPlayerById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const player = await playerQueries.getPlayerProfile(parseInt(id));
    if (!player) {
      return res.status(404).json({
        message: "Player not found",
        response: null,
        error: "Player not found",
      });
    }

    return res.status(200).json({
      message: "Player profile fetched successfully",
      response: {
        data: player,
      },
      error: null,
    });
  },
);

export const deletePlayer = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const player = await playerQueries.getPlayerById(parseInt(id));
    if (!player) {
      return res.status(404).json({
        message: "Player not found",
        response: null,
        error: "Player not found",
      });
    }

    await playerQueries.deletePlayer(parseInt(id));

    return res.status(200).json({
      message: "Player deleted successfully",
      response: null,
      error: null,
    });
  },
);
