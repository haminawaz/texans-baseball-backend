import { Request, Response } from "express";
import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../../middleware/errorHandler";
import coachQueries from "../../queries/coach/auth";
import emailService from "../../services/email.service";
import emailTemplates from "../../lib/email-templates";
import { uploadFileToS3, deleteFileFromS3 } from "../../lib/s3";
import configs from "../../config/env";

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const coach = await coachQueries.getCoachWithPassword(email);
  if (!coach) {
    return res.status(401).json({
      message: "Invalid credentials",
      response: null,
      error: "Invalid credentials",
    });
  }
  if (!coach.email_verified) {
    return res.status(403).json({
      message: "Please verify your email",
      response: null,
      error: "Please verify your email",
    });
  }
  if (!coach.password) {
    return res.status(400).json({
      message: "Coach password has not been set",
      response: null,
      error: "Coach password has not been set",
    });
  }

  const isValid = await bcrypt.compare(password, coach.password);
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

  const coachData = {
    email: coach.email,
    first_name: coach.first_name,
    last_name: coach.last_name,
    phone: coach.phone,
    profile_picture: coach.profile_picture,
  };

  const data = {
    data: coachData,
    token,
  };

  return res.status(200).json({
    message: "Coach logged in successfully",
    response: data,
    error: null,
  });
});

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const coachId = req.decoded.userId as number;
    const updateData = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const coach = await coachQueries.getCoachById(coachId);
    if (!coach) {
      return res.status(404).json({
        message: "Coach not found",
        response: null,
        error: "Coach not found",
      });
    }

    if (files && files.profile_picture?.[0]) {
      if (coach.profile_picture) {
        await deleteFileFromS3(coach.profile_picture);
      }
      const profilePicUrl = await uploadFileToS3(files.profile_picture[0], "coaches/profiles");
      updateData.profile_picture = profilePicUrl;
    }

    const updatedProfile = await coachQueries.updateProfile({
      coach_id: coachId,
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
    const coachId = req.decoded.userId as number;
    const { old_password, new_password } = req.body;

    const coach = await coachQueries.getCoachPassword(coachId);
    if (!coach) {
      return res.status(404).json({
        message: "Coach not found",
        response: null,
        error: "Coach not found",
      });
    }
    if (!coach.password) {
      return res.status(400).json({
        message: "Coach password has not been set",
        response: null,
        error: "Coach password has not been set",
      });
    }

    const isOldPasswordValid = await bcrypt.compare(
      old_password,
      coach.password,
    );

    if (!isOldPasswordValid) {
      return res.status(400).json({
        message: "Invalid Old password",
        response: null,
        error: "Invalid Old password",
      });
    }

    const hashedNewPassword = await bcrypt.hash(new_password, 10);
    const updatePasswordResult = await coachQueries.updatePassword(
      coachId,
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

    const coach = await coachQueries.getCoach(email);
    if (!coach) {
      return res.status(404).json({
        message: "Coach not found",
        response: null,
        error: "Coach not found",
      });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    await coachQueries.forgotPassword({
      coach_id: coach.id,
      reset_password_otp: otp,
      reset_password_otp_expiry: otpExpiry,
    });
    const action = coach.email_verified ? "reset" : "set";
    const resetUrl = `${configs.frontendBaseUrl}/coach/reset-password?email=${encodeURIComponent(email)}&otp=${otp}&action=${action}`;

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
    const action = req.query.action as string;
    const { password } = req.body;

    const coach = await coachQueries.getCoach(email);
    if (!coach) {
      return res.status(404).json({
        message: "Coach not found",
        response: null,
        error: "Coach not found",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const result = await coachQueries.resetPassword({
      coach_id: coach.id,
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
