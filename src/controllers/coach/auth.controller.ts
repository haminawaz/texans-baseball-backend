import { Request, Response } from "express";
import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../../middleware/errorHandler";
import coachQueries from "../../queries/coach/auth";
import emailService from "../../services/email.service";
import emailTemplates from "../../lib/email-templates";
import configs from "../../config/env";
import eventQueries from "../../queries/admin/event";

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

    const coach = await coachQueries.getCoachById(coachId);
    if (!coach) {
      return res.status(404).json({
        message: "Coach not found",
        response: null,
        error: "Player not found",
      });
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
    if (!coach.email_verified) {
      return res.status(403).json({
        message: "Please verify your email",
        response: null,
        error: "Please verify your email",
      });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    await coachQueries.forgotPassword({
      coach_id: coach.id,
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

export const getTimesheet = asyncHandler(
  async (req: Request, res: Response) => {
    const coachId = req.decoded.userId;
    const { period, startDate, endDate } = req.query;

    const now = new Date();
    let start, end;

    if (period === "this_week" || (!period && !startDate)) {
      const day = now.getDay();
      const diff = now.getDate() - day;
      start = new Date(now.setDate(diff));
      start.setHours(0, 0, 0, 0);

      end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
    } else if (period === "this_month") {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
    } else if (period === "custom" && startDate && endDate) {
      start = new Date(startDate as string);
      end = new Date(endDate as string);
      end.setHours(23, 59, 59, 999);
    } else {
      const day = now.getDay();
      const diff = now.getDate() - day;
      start = new Date(now.setDate(diff));
      start.setHours(0, 0, 0, 0);
      end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
    }

    const result = await eventQueries.getTimesheet(
      start,
      end,
      coachId as number,
    );

    let totalHourlyHours = 0;
    const hoursByType: Record<string, number> = {};

    result.forEach((item: any) => {
      totalHourlyHours += item.total_hours;
      const type = item.event_type || "Other";
      hoursByType[type] = (hoursByType[type] || 0) + item.total_hours;
    });

    const typeBreakdown = Object.entries(hoursByType)
      .map(([type, hours]) => `${type}: ${hours.toFixed(1)}h`)
      .join(" • ");

    return res.status(200).json({
      message: "Timesheet fetched successfully",
      response: {
        data: {
          timesheet: result,
          total_hourly_hours: parseFloat(totalHourlyHours.toFixed(1)),
          breakdown: typeBreakdown,
        },
      },
      error: null,
    });
  },
);
