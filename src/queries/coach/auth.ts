import prisma from "../../lib/prisma";
import {
  UpdateCoach,
  ForgotPassword,
  ResetPassword,
} from "../../interface/coach/auth";

const getCoach = async (email: string) => {
  return prisma.coaches.findUnique({
    where: { email },
    select: {
      id: true,
      email_verified: true,
      permission_level: true,
    },
  });
};

const getCoachById = async (id: number) => {
  return prisma.coaches.findUnique({
    where: { id },
    select: {
      id: true,
      permission_level: true,
      email_verified: true,
    },
  });
};

const getCoachWithPassword = async (email: string) => {
  return prisma.coaches.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      first_name: true,
      last_name: true,
      phone: true,
      password: true,

      email_verified: true,
    },
  });
};

const updateProfile = async (coachData: UpdateCoach) => {
  const { coach_id, ...rest } = coachData;

  return prisma.coaches.update({
    where: { id: coach_id },
    data: {
      ...(rest as any),
    },
  });
};

const getCoachPassword = async (coachId: number) => {
  return prisma.coaches.findUnique({
    where: { id: coachId },
    select: {
      password: true,
    },
  });
};

const updatePassword = async (coachId: number, password: string) => {
  return prisma.coaches.update({
    where: { id: coachId },
    data: {
      password: password,
    },
  });
};

const forgotPassword = async (forgotPassword: ForgotPassword) => {
  return prisma.coaches.update({
    where: { id: forgotPassword.coach_id },
    data: {
      reset_password_otp: forgotPassword.reset_password_otp,
      reset_password_otp_expires_at: forgotPassword.reset_password_otp_expiry,
    },
    select: {
      first_name: true,
      last_name: true,
    },
  });
};

const resetPassword = async (resetPassword: ResetPassword) => {
  try {
    const result = await prisma.coaches.update({
      where: {
        id: resetPassword.coach_id,
        reset_password_otp: resetPassword.otp,
        reset_password_otp_expires_at: { gt: new Date() },
      },
      data: {
        password: resetPassword.new_password,
        reset_password_otp: null,
        reset_password_otp_expires_at: null,
        ...(resetPassword.verify_email && { email_verified: true }),
      },
    });

    return result;
  } catch (error) {
    return null;
  }
};

const checkCoachesExist = async (ids: number[]) => {
  const count = await prisma.coaches.count({
    where: {
      id: { in: ids },
    },
  });
  return count === ids.length;
};

export default {
  getCoach,
  getCoachById,
  getCoachWithPassword,
  getCoachPassword,
  updateProfile,
  updatePassword,
  forgotPassword,
  resetPassword,
  checkCoachesExist,
};
