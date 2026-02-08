import { Request, Response } from "express";
import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../../middleware/errorHandler";
import playerQueries from "../../queries/player/auth";
import emailService from "../../services/email.service";
import { uploadFileToS3, deleteFileFromS3 } from "../../lib/s3";
import emailTemplates from "../../lib/email-templates";
import configs from "../../config/env";

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const { first_name, last_name, email, password, team_code } = req.body;

  const team = await playerQueries.getTeamByCode(team_code);
  if (!team) {
    return res.status(404).json({
      message: "Team not found with the provided code",
      response: null,
      error: "Team not found",
    });
  }

  const existingPlayer = await playerQueries.getPlayerByEmail(email);
  if (existingPlayer) {
    if (existingPlayer.email_verified) {
      return res.status(409).json({
        message: "Player already exists",
        response: null,
        error: "Player already exists",
      });
    }

    const isOtpExpired =
      !existingPlayer.email_verification_expires_at ||
      existingPlayer.email_verification_expires_at < new Date();

    if (!isOtpExpired) {
      return res.status(409).json({
        message: "Player already exists",
        response: null,
        error: "Player already exists",
      });
    }
  }

  const otp = crypto.randomInt(100000, 999999).toString();
  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
  const hashedNewPassword = await bcrypt.hash(password, 10);

  await playerQueries.createOrUpdatePlayerTransaction({
    first_name,
    last_name,
    email,
    password: hashedNewPassword,
    team_id: team.id,
    email_verification_otp_expiry: otpExpiry,
    email_verification_otp: String(otp),
  });

  const fullName = `${first_name} ${last_name}`;
  const dynamicData = {
    subject: "Verify Your Email",
    to_email: email,
  };
  await emailService.sendMail(
    emailTemplates.getRegistrationEmailBody(fullName, Number(otp)),
    dynamicData,
  );

  return res.status(201).json({
    message: "Player created successfully",
    response: null,
    error: null,
  });
});

export const verifyPlayerEmail = async (req: Request, res: Response) => {
  try {
    const email = req.query.email as string;
    const otp = req.query.otp as string;

    const player = await playerQueries.verifyPlayerEmail(email, otp);
    if (!player) {
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

  const player = await playerQueries.getPlayerWithPassword(email);
  if (!player) {
    return res.status(401).json({
      message: "Invalid credentials",
      response: null,
      error: "Invalid credentials",
    });
  }
  if (!player.email_verified) {
    return res.status(403).json({
      message: "Please verify your email",
      response: null,
      error: "Please verify your email",
    });
  }

  const isValid = await bcrypt.compare(password, player.password);
  if (!isValid) {
    return res.status(401).json({
      message: "Invalid credentials",
      response: null,
      error: "Invalid credentials",
    });
  }

  const token = jwt.sign({ email }, configs.jwtSecret, {
    expiresIn: "24h",
  });

  await playerQueries.updateLastLogin(player.id);

  const playerData = {
    email: player.email,
    first_name: player.first_name,
    last_name: player.last_name,
    profile_picture: player.profile_picture,
  };

  const data = {
    data: playerData,
    token,
  };

  return res.status(200).json({
    message: "Player logged in successfully",
    response: data,
    error: null,
  });
});

export const getProfile = async (req: Request, res: Response) => {
  try {
    const playerId = req.decoded.userId as number;

    const player = await playerQueries.getPlayerProfile(playerId);

    return res.status(200).json({
      message: "Profile fetched successfully",
      response: {
        data: player,
      },
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

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const playerId = req.decoded.userId as number;
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
        updateData.jersey_number
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
      const profilePicUrl = await uploadFileToS3(files.profile_picture[0], "players/profiles");
      updateData.profile_picture = profilePicUrl;
    }

    if (files && files.hero_image?.[0]) {
      if (player.hero_image) {
        await deleteFileFromS3(player.hero_image);
      }
      const heroImageUrl = await uploadFileToS3(files.hero_image[0], "players/heros");
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

export const updatePassword = async (req: Request, res: Response) => {
  try {
    const playerId = req.decoded.userId as number;
    const { old_password, new_password } = req.body;

    const player = await playerQueries.getPlayerPassword(playerId);
    if (!player) {
      return res.status(404).json({
        message: "Player not found",
        response: null,
        error: "Player not found",
      });
    }

    const isOldPasswordValid = await bcrypt.compare(
      old_password,
      player.password,
    );

    if (!isOldPasswordValid) {
      return res.status(400).json({
        message: "Invalid Old password",
        response: null,
        error: "Invalid Old password",
      });
    }

    const hashedNewPassword = await bcrypt.hash(new_password, 10);
    const updatePasswordResult = await playerQueries.updatePassword(
      playerId,
      hashedNewPassword,
    );
    if (!updatePasswordResult) {
      return res.status(400).json({
        message: "Failed to update password",
        response: null,
        error: "Failed to update password",
      });
    }

    return res.status(200).json({
      message: "Password updated successfully",
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

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const player = await playerQueries.getPlayerByEmail(email);
    if (!player) {
      return res.status(404).json({
        message: "Player not found",
        response: null,
        error: "Player not found",
      });
    }
    if (!player.email_verified) {
      return res.status(403).json({
        message: "Please verify your email",
        response: null,
        error: "Please verify your email",
      });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    await playerQueries.forgotPassword({
      player_id: player.id,
      reset_password_otp: otp,
      reset_password_otp_expiry: otpExpiry,
    });

    const dynamicData = {
      subject: "Reset your password",
      to_email: email,
    };
    await emailService.sendMail(
      emailTemplates.getForgotPasswordEmailBody(Number(otp)),
      dynamicData,
    );

    return res.status(200).json({
      message: `Email has been sent successfully for reset password`,
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

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const email = req.query.email as string;
    const otp = req.query.otp as string;
    const { password } = req.body;

    const existingPlayer = await playerQueries.getPlayerByEmail(email);
    if (!existingPlayer) {
      return res.status(404).json({
        message: "Player not found",
        response: null,
        error: "Player not found",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const player = await playerQueries.resetPassword({
      player_id: existingPlayer.id,
      otp,
      new_password: hashPassword,
    });
    if (!player) {
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
