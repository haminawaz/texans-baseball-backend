import { Request, Response } from "express";
import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../../middleware/errorHandler";
import parentQueries from "../../queries/parent/parent";
import authQueries from "../../queries/parent/auth";
import emailService from "../../services/email.service";
import emailTemplates from "../../lib/email-templates";
import configs from "../../config/env";

export const getPlayersByTeamCode = asyncHandler(
  async (req: Request, res: Response) => {
    const teamCode = String(req.query.team_code);

    const players = await authQueries.getPlayersByTeamCode(teamCode);
    if (!players) {
      return res.status(404).json({
        message: "Team not found",
        response: null,
        error: "Team not found",
      });
    }

    return res.status(200).json({
      message: "Players fetched successfully",
      response: {
        data: players,
      },
      error: null,
    });
  },
);

export const acceptInvitation = asyncHandler(
  async (req: Request, res: Response) => {
    const invitationToken = String(req.query.invitation_token);

    const invitation =
      await authQueries.getPlayerParentByToken(invitationToken);
    if (!invitation) {
      return res.status(404).json({
        message: "Invalid invitation or already accepted",
        response: null,
        error: "Invalid invitation or already accepted",
      });
    }

    if (
      invitation.invitation_expires_at &&
      new Date() > invitation.invitation_expires_at
    ) {
      return res.status(400).json({
        message: "Invitation expired",
        response: null,
        error: "Invitation expired",
      });
    }

    await authQueries.acceptInvitation(
      invitation.player_id,
      invitation.parent_id,
    );

    const parent = invitation.parent;
    if (!parent.email_verified) {
      const otp = crypto.randomInt(100000, 999999).toString();
      const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

      await authQueries.forgotPassword({
        parent_id: parent.id,
        reset_password_otp: otp,
        reset_password_otp_expiry: otpExpiry,
      });

      const action = "set";
      const resetUrl = `${configs.frontendBaseUrl}/parent/reset-password?email=${encodeURIComponent(parent.email)}&otp=${otp}&action=${action}`;

      const dynamicData = {
        subject: "Set your password",
        to_email: parent.email,
      };

      await emailService.sendMail(
        emailTemplates.getForgotPasswordEmailBody(
          Number(otp),
          resetUrl,
          action,
        ),
        dynamicData,
      );
    }

    return res.status(200).json({
      message:
        "Invitation accepted successfully" + !parent.email_verified
          ? "Please check your email to set your password"
          : "",
      response: null,
      error: null,
    });
  },
);

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const { first_name, last_name, email, password, player_id, relationship } =
    req.body;

  const parentExist = await parentQueries.getParentByEmail(email);
  if (parentExist) {
    if (parentExist.email_verified) {
      return res.status(409).json({
        message: "Parent already exists",
        response: null,
        error: "Parent already exists",
      });
    }

    const isOtpExpired =
      !parentExist.email_verification_expires_at ||
      parentExist.email_verification_expires_at < new Date();
    if (!isOtpExpired) {
      return res.status(409).json({
        message: "Player already exists",
        response: null,
        error: "Player already exists",
      });
    }
  }

  const playerExist = await parentQueries.getPlayerById(player_id);
  if (!playerExist) {
    return res.status(404).json({
      message: "Player not found",
      response: null,
      error: "Player not found",
    });
  }

  const otp = crypto.randomInt(100000, 999999).toString();
  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
  const hashPassword = await bcrypt.hash(password, 10);

  await authQueries.parentSignup({
    player_id,
    first_name,
    last_name,
    email,
    password: hashPassword,
    relationship,
    email_verification_otp: otp,
    email_verification_expires_at: otpExpiry,
  });

  const dynamicData = {
    subject: "Verify your email",
    to_email: email,
  };
  const name = first_name + " " + last_name;
  await emailService.sendMail(
    emailTemplates.getRegistrationEmailBody(name, Number(otp)),
    dynamicData,
  );

  return res.status(201).json({
    message:
      "Parent signed up successfully. Please check your email to verify your account",
    response: null,
    error: null,
  });
});

export const verifyPlayerEmail = async (req: Request, res: Response) => {
  try {
    const email = req.query.email as string;
    const otp = req.query.otp as string;

    const parent = await authQueries.verifyPlayerEmail(email, otp);
    if (!parent) {
      return res.status(400).json({
        message: "Invalid otp or expired",
        response: null,
        error: "Invalid otp or expired",
      });
    }

    return res.status(200).json({
      message: "Email verified successfully",
      response: null,
      error: null,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";

    return res.status(500).json({
      message: errorMessage,
      response: null,
      error: errorMessage,
    });
  }
};

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const parent = await authQueries.getParentWithPassword(email);
  if (!parent) {
    return res.status(401).json({
      message: "Invalid credentials",
      response: null,
      error: "Invalid credentials",
    });
  }
  if (!parent.password) {
    return res.status(400).json({
      message: "Parent password has not been set",
      response: null,
      error: "Parent password has not been set",
    });
  }
  if (!parent.email_verified) {
    return res.status(400).json({
      message: "Parent email not verified",
      response: null,
      error: "Parent email not verified",
    });
  }

  const isValid = await bcrypt.compare(password, parent.password);
  if (!isValid) {
    return res.status(401).json({
      message: "Invalid credentials",
      response: null,
      error: "Invalid credentials",
    });
  }

  const token = jwt.sign(
    { email, userId: parent.id, role: "parent" },
    configs.jwtSecret,
    {
      expiresIn: "24h",
    },
  );

  const parentData = {
    id: parent.id,
    email: parent.email,
    first_name: parent.first_name,
    last_name: parent.last_name,
  };

  return res.status(200).json({
    message: "Parent logged in successfully",
    response: {
      data: parentData,
      token,
    },
    error: null,
  });
});

export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    const parent = await parentQueries.getParentByEmail(email);
    if (!parent) {
      return res.status(404).json({
        message: "Parent not found",
        response: null,
        error: "Parent not found",
      });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    await authQueries.forgotPassword({
      parent_id: parent.id,
      reset_password_otp: otp,
      reset_password_otp_expiry: otpExpiry,
    });
    const action = parent.email_verified ? "reset" : "set";
    const resetUrl = `${configs.frontendBaseUrl}/parent/reset-password?email=${encodeURIComponent(email)}&otp=${otp}&action=${action}`;

    const dynamicData = {
      subject: action === "set" ? "Set your password" : "Reset your password",
      to_email: email,
    };

    await emailService.sendMail(
      emailTemplates.getForgotPasswordEmailBody(Number(otp), resetUrl, action),
      dynamicData,
    );

    return res.status(200).json({
      message: `Email has been sent successfully for ${action} password`,
      response: null,
      error: null,
    });
  },
);

export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const email = req.query.email as string;
    const otp = req.query.otp as string;
    const action = req.query.action as string;
    const { password } = req.body;

    const parent = await parentQueries.getParentByEmail(email);
    if (!parent) {
      return res.status(404).json({
        message: "Parent not found",
        response: null,
        error: "Parent not found",
      });
    }
    if (!parent.email_verified && action === "reset") {
      return res.status(403).json({
        message: "Invalid action",
        response: null,
        error: "Invalid action",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const result = await authQueries.resetPassword({
      parent_id: parent.id,
      otp,
      new_password: hashPassword,
      verify_email: action === "set",
    });

    if (!result) {
      return res.status(400).json({
        message: "Invalid token or expired",
        response: null,
        error: "Invalid token or expired",
      });
    }

    const dynamicData = {
      subject: "Reset your password",
      to_email: email,
    };

    await emailService.sendMail(
      emailTemplates.getResetPasswordEmailBody(),
      dynamicData,
    );

    return res.status(200).json({
      message: "Password reset successfully",
      response: null,
      error: null,
    });
  },
);
