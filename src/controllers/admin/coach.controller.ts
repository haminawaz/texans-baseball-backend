import { Request, Response } from "express";
import crypto from "crypto";
import { asyncHandler } from "../../middleware/errorHandler";
import coachQueries from "../../queries/admin/coach";
import teamQueries from "../../queries/admin/team";
import emailService from "../../services/email.service";
import emailTemplates from "../../lib/email-templates";
import configs from "../../config/env";

export const inviteCoach = asyncHandler(async (req: Request, res: Response) => {
  const { first_name, last_name, email, role, permission_level } = req.body;

  const existingCoach = await coachQueries.getCoachByEmail(email);
  if (
    existingCoach &&
    (existingCoach.email_verified ||
      (existingCoach.reset_password_otp_expires_at &&
        existingCoach.reset_password_otp_expires_at > new Date()))
  ) {
    return res.status(409).json({
      message: "Coach already exists",
      response: null,
      error: "Coach already exists",
    });
  }

  const otp = crypto.randomInt(100000, 999999).toString();
  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
  const setPasswordUrl = `${configs.frontendBaseUrl}/auth/create-password?action=set&email=${email}`;

  await coachQueries.createOrUpdateCoachInvitation({
    first_name,
    last_name,
    email,
    role,
    permission_level,
    reset_password_otp: otp,
    reset_password_otp_expires_at: otpExpiry,
  });

  const fullName = `${first_name} ${last_name}`;
  const dynamicData = {
    subject: "Team Invitation",
    to_email: email,
  };

  await emailService.sendMail(
    emailTemplates.getCoachInvitationEmailBody(fullName, setPasswordUrl, otp),
    dynamicData,
  );

  return res.status(201).json({
    message: "Invitation sent successfully",
    response: null,
    error: null,
  });
});

export const getCoaches = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.pageSize as string) || 10;
  const status = req.query.status as string;
  const accepted = status === "accepted";

  const result = await coachQueries.getCoaches(page, limit, accepted);

  return res.status(200).json({
    message: "Coaches fetched successfully",
    response: {
      data: result,
    },
    error: null,
  });
});

export const getCoachById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const existingCoach = await coachQueries.getCoachDetails(parseInt(id));
    if (!existingCoach) {
      return res.status(404).json({
        message: "Coach not found",
        response: null,
        error: "Coach not found",
      });
    }

    return res.status(200).json({
      message: "Coach details fetched successfully",
      response: {
        data: existingCoach,
      },
      error: null,
    });
  },
);

export const getCoachTeams = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const existingCoach = await coachQueries.getCoachById(parseInt(id));
    if (!existingCoach) {
      return res.status(404).json({
        message: "Coach not found",
        response: null,
        error: "Coach not found",
      });
    }

    const result = await coachQueries.getCoachTeams(parseInt(id));

    return res.status(200).json({
      message: "Coach teams fetched successfully",
      response: {
        data: result?.teams?.map((team) => team.team),
      },
      error: null,
    });
  },
);

export const updateCoach = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { team_id, action } = req.body;

  const existingCoach = await coachQueries.getCoachById(parseInt(id));
  if (!existingCoach) {
    return res.status(404).json({
      message: "Coach not found",
      response: null,
      error: "Coach not found",
    });
  }

  const existingTeam = await teamQueries.getTeamById(parseInt(team_id));
  if (!existingTeam) {
    return res.status(404).json({
      message: "Team not found",
      response: null,
      error: "Team not found",
    });
  }

  const existingTeamCoach = await coachQueries.getTeamCoach(
    parseInt(id),
    parseInt(team_id),
  );
  if (existingTeamCoach && action === "assign") {
    return res.status(409).json({
      message: "Team coach already exists",
      response: null,
      error: "Team coach already exists",
    });
  }
  if (!existingTeamCoach && action === "remove") {
    return res.status(404).json({
      message: "Team coach not found",
      response: null,
      error: "Team coach not found",
    });
  }

  if (action === "assign") {
    await coachQueries.assignTeam(parseInt(id), team_id);
  } else if (action === "remove") {
    await coachQueries.removeTeam(parseInt(id), team_id);
  }

  return res.status(200).json({
    message:
      action === "assign"
        ? "Team assigned successfully"
        : "Team removed successfully",
    response: null,
    error: null,
  });
});

export const deleteCoach = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const existingCoach = await coachQueries.getCoachById(parseInt(id));
  if (!existingCoach) {
    return res.status(404).json({
      message: "Coach not found",
      response: null,
      error: "Coach not found",
    });
  }

  await coachQueries.deleteCoach(parseInt(id));

  return res.status(200).json({
    message: "Coach deleted successfully",
    response: null,
    error: null,
  });
});
