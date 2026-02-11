import { Request, Response } from "express";
import { asyncHandler } from "../../middleware/errorHandler";
import playerQueries from "../../queries/player/auth";
import uniformQueries from "../../queries/player/uniform-sizing";
import { uploadFileToS3, deleteFileFromS3 } from "../../lib/s3";

export const getPlayerProfile = asyncHandler(async (req: Request, res: Response) => {
  const playerId = req.playerId as number;

  const player = await playerQueries.getPlayerProfile(playerId);

  return res.status(200).json({
    message: "Profile fetched successfully",
    response: {
      data: player,
    },
    error: null,
  });
});

export const updatePlayerProfile = asyncHandler(async (req: Request, res: Response) => {
  const playerId = req.playerId as number;
  const updateData = req.body;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const player = await playerQueries.getPlayerById(playerId);
  if (!player) {
    return res.status(404).json({
      message: "Player not found",
      response: null,
      error: "Player not found",
    });
  }

  if (updateData.jersey_number) {
    const jerseyNumber = await playerQueries.getJerseyNumber(
      playerId,
      updateData.jersey_number,
    );
    if (jerseyNumber) {
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

  const updatedProfile = await playerQueries.updateProfile({
    player_id: playerId,
    ...updateData,
  });
  if (!updatedProfile) {
    return res.status(400).json({
      message: "Failed to update profile",
      response: null,
      error: "Failed to update profile",
    });
  }

  return res.status(200).json({
    message: "Profile updated successfully",
    response: null,
    error: null,
  });
});

export const getUniformSizing = asyncHandler(async (req: Request, res: Response) => {
    const playerId = req.playerId as number;

    const sizing = await uniformQueries.getUniformSizing(playerId);

    return res.status(200).json({
      message: "Uniform sizing fetched successfully",
      response: {
        data: sizing,
      },
      error: null,
    });
});

export const updateUniformSizing = asyncHandler(async (req: Request, res: Response) => {
    const playerId = req.playerId as number;
    const updateData = req.body;

    const updatedSizing = await uniformQueries.updateUniformSizing({
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
});
