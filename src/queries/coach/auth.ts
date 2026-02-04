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

const checkPlayerAccess = async (coachId: number, playerId: number) => {
  const player = await prisma.players.findUnique({
    where: { id: playerId },
    select: { team_id: true },
  });

  if (!player || !player.team_id) return false;

  const access = await prisma.teamCoaches.findFirst({
    where: {
      coach_id: coachId,
      team_id: player.team_id,
    },
  });

  return !!access;
};

const getCoachPlayers = async (coachId: number, filters: any) => {
  const coachTeams = await prisma.teamCoaches.findMany({
    where: { coach_id: coachId },
    select: { team_id: true },
  });

  const teamIds = coachTeams.map((ct) => ct.team_id);

  const where: any = {
    team_id: { in: teamIds },
  };

  if (filters.name) {
    where.OR = [
      { first_name: { contains: filters.name, mode: "insensitive" } },
      { last_name: { contains: filters.name, mode: "insensitive" } },
    ];
  }

  if (filters.team_id) {
    const requestedTeamId = parseInt(filters.team_id);
    if (teamIds.includes(requestedTeamId)) {
      where.team_id = requestedTeamId;
    } else {
      return { players: [], total: 0 };
    }
  }

  if (filters.position) {
    where.positions = { has: filters.position };
  }

  const [players, total] = await Promise.all([
    prisma.players.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        jersey_number: true,
        age: true,
        positions: true,
        email: true,
        phone: true,
        height: true,
        weight: true,
        high_school: true,
        team: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
    }),
    prisma.players.count({ where }),
  ]);

  return { players, total };
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
  getCoachPlayers,
  checkPlayerAccess,
};
