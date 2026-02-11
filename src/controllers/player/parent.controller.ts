import { Request, Response } from "express";
import crypto from "crypto";
import { asyncHandler } from "../../middleware/errorHandler";
import playerQueries from "../../queries/player/auth";
import parentQueries from "../../queries/parent/parent";
import emailService from "../../services/email.service";
import emailTemplates from "../../lib/email-templates";
import configs from "../../config/env";

export const addParent = asyncHandler(async (req: Request, res: Response) => {
  const playerId = req.decoded.userId as number;
  const { first_name, last_name, email, relationship } = req.body;

  let parent = await parentQueries.getParentByEmail(email);
  let isNewParent = false;

  const invitationToken = crypto.randomBytes(32).toString("hex");
  const invitationExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  if (!parent) {
    parent = await parentQueries.createParent(playerId, {
      first_name,
      last_name,
      email,
      relationship,
      invitation_token: invitationToken,
      invitation_expires_at: invitationExpiry,
    });
    isNewParent = true;
  } else {
    const existingPlayerParent = await parentQueries.getParentLink(
      playerId,
      parent.id,
    );
    if (existingPlayerParent) {
      return res.status(409).json({
        message: "Parent already linked to player",
        response: null,
        error: "Parent already linked to player",
      });
    }
    await parentQueries.createPlayerParent({
      player_id: playerId,
      parent_id: parent.id,
      relationship,
      invitation_token: invitationToken,
      invitation_expires_at: invitationExpiry,
    });
  }

  const player = await playerQueries.getPlayerById(playerId);
  const playerName = player
    ? `${player.first_name} ${player.last_name}`
    : "A player";
  const parentName = `${parent.first_name} ${parent.last_name}`;
  const inviteUrl = `${configs.frontendBaseUrl}/accept-invitation?token=${invitationToken}&email=${email}`;

  const dynamicData = {
    subject: "Invitation to join Texans Baseball as a Parent",
    to_email: email,
  };

  await emailService.sendMail(
    emailTemplates.getParentInvitationEmailBody(
      parentName,
      playerName,
      inviteUrl,
    ),
    dynamicData,
  );

  return res.status(200).json({
    message: isNewParent
      ? "Parent created and invitation sent"
      : "Invitation sent to existing parent",
    response: null,
    error: null,
  });
});

export const getParents = asyncHandler(async (req: Request, res: Response) => {
  const playerId = req.decoded.userId as number;

  const parents = await parentQueries.getParentLinksForPlayer(playerId);

  return res.status(200).json({
    message: "Parents fetched successfully",
    response: {
      data: parents,
    },
    error: null,
  });
});

export const removeParent = asyncHandler(
  async (req: Request, res: Response) => {
    const playerId = req.decoded.userId as number;
    const parentId = parseInt(req.params.parentId);

    await parentQueries.removeParentLink(playerId, parentId);

    return res.status(200).json({
      message: "Parent removed successfully",
      response: null,
      error: null,
    });
  },
);
