import { Request, Response } from "express";
import { asyncHandler } from "../../middleware/errorHandler";
import teamQueries from "../../queries/admin/team";
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

export const updatePlayer = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;

    const player = await playerQueries.getPlayerById(parseInt(id));
    if (!player) {
      return res.status(404).json({
        message: "Player not found",
        response: null,
        error: "Player not found",
      });
    }

    if (updateData.jersey_number !== undefined) {
      const jerseyNumber = await playerQueries.getJerseyNumber(
        parseInt(id),
        updateData.jersey_number,
      );
      if (jerseyNumber) {
        return res.status(409).json({
          message: "This jersey number is already in use",
          response: null,
          error: "This jersey number is already in use",
        });
      }
    }

    await playerQueries.updateProfile({
      player_id: parseInt(id),
      ...updateData,
    });

    return res.status(200).json({
      message: "Player profile updated successfully",
      response: null,
      error: null,
    });
  },
);

export const assignTeam = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { team_id } = req.body;

  const player = await playerQueries.getPlayerById(parseInt(id));
  if (!player) {
    return res.status(404).json({
      message: "Player not found",
      response: null,
      error: "Player not found",
    });
  }

  const team = await teamQueries.getTeamById(team_id);
  if (!team) {
    return res.status(404).json({
      message: "Team not found",
      response: null,
      error: "Team not found",
    });
  }

  if (player.team_id === team_id) {
    return res.status(409).json({
      message: "Player is already assigned to this team",
      response: null,
      error: "Player is already assigned to this team",
    });
  }

  await playerQueries.assignPlayerToTeam(parseInt(id), team_id);

  return res.status(200).json({
    message: "Player assigned to team successfully",
    response: null,
    error: null,
  });
});

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
