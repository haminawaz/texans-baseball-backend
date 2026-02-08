import { Request, Response } from "express";
import { asyncHandler } from "../../middleware/errorHandler";
import coachQueries from "../../queries/coach/player";
import playerQueries from "../../queries/player/auth";
import { deleteFileFromS3, uploadFileToS3 } from "../../lib/s3";

export const getPlayers = asyncHandler(async (req: Request, res: Response) => {
  const coachId = req.decoded.userId as number;
  const name = req.query.name as string;
  const team_id = req.query.team_id as string;
  const position = req.query.position as string;

  const result = await coachQueries.getCoachPlayers(coachId, {
    name,
    team_id,
    position,
  });

  return res.status(200).json({
    message: "Players fetched successfully",
    response: {
      data: result.players,
      total: result.total,
    },
    error: null,
  });
});

export const getPlayerById = asyncHandler(
  async (req: Request, res: Response) => {
    const coachId = req.decoded.userId as number;
    const { id } = req.params;
    const playerId = parseInt(id);

    const hasAccess = await coachQueries.checkPlayerAccess(coachId, playerId);
    if (!hasAccess) {
      return res.status(403).json({
        message: "You do not have access to this player",
        response: null,
        error: "You do not have access to this player",
      });
    }

    const player = await playerQueries.getPlayerProfile(playerId);
    if (!player) {
      return res.status(404).json({
        message: "Player not found",
        response: null,
        error: "Player not found",
      });
    }

    return res.status(200).json({
      message: "Player details fetched successfully",
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
    const playerId = parseInt(id);
    const updateData = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (req.decoded.permissionLevel === "read_only") {
      return res.status(403).json({
        message: "You do not have permission to update the player",
        response: null,
        error: "You do not have permission to update the player",
      });
    }

    const player = await playerQueries.getPlayerById(parseInt(id));
    if (!player) {
      return res.status(404).json({
        message: "Player not found",
        response: null,
        error: "Player not found",
      });
    }

    if (updateData.jersey_number !== undefined) {
      const existingJersey = await playerQueries.getJerseyNumber(
        playerId,
        updateData.jersey_number,
      );
      if (existingJersey) {
        return res.status(409).json({
          message: "This jersey number is already in use by another player",
          response: null,
          error: "This jersey number is already in use by another player",
        });
      }
    }

    if (files && files.profile_picture?.[0]) {
      if (player.profile_picture) {
        await deleteFileFromS3(player.profile_picture);
      }
      const profilePicUrl = await uploadFileToS3(
        files.profile_picture[0],
        "players/profiles",
      );
      updateData.profile_picture = profilePicUrl;
    }

    if (files && files.hero_image?.[0]) {
      if (player.hero_image) {
        await deleteFileFromS3(player.hero_image);
      }
      const heroImageUrl = await uploadFileToS3(
        files.hero_image[0],
        "players/heros",
      );
      updateData.hero_image = heroImageUrl;
    }

    await playerQueries.updateProfile({
      player_id: playerId,
      ...updateData,
    });

    return res.status(200).json({
      message: "Player profile updated successfully",
      response: null,
      error: null,
    });
  },
);
