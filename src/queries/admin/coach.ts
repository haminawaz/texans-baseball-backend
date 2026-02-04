import prisma from "../../lib/prisma";
import { InviteCoach } from "../../interface/admin/coach";

const getCoachByEmail = async (email: string) => {
  return prisma.coaches.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      email_verified: true,
      reset_password_otp_expires_at: true,
    },
  });
};

const createOrUpdateCoachInvitation = async (coachData: InviteCoach) => {
  return prisma.coaches.upsert({
    where: { email: coachData.email },
    update: {
      first_name: coachData.first_name,
      last_name: coachData.last_name,
      role: coachData.role,
      permission_level: coachData.permission_level,
      reset_password_otp: coachData.reset_password_otp,
      reset_password_otp_expires_at:
        coachData.reset_password_otp_expires_at,
    },
    create: {
      first_name: coachData.first_name,
      last_name: coachData.last_name,
      email: coachData.email,
      role: coachData.role,
      permission_level: coachData.permission_level,
      reset_password_otp: coachData.reset_password_otp,
      reset_password_otp_expires_at:
        coachData.reset_password_otp_expires_at,
    },
  });
};

const getCoaches = async (page: number, limit: number, accepted: boolean) => {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    prisma.coaches.findMany({
      where: { email_verified: accepted },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        profile_picture: true,
        first_name: true,
        last_name: true,
        email: true,
        phone: true,
        role: true,
        permission_level: true,
        teams: {
          select: {
            team: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      skip,
      take: limit,
    }),
    prisma.coaches.count({
      where: { email_verified: accepted },
    }),
  ]);

  const coaches = data.map((coach) => ({
    ...coach,
    teams: coach.teams.map((team) => team.team),
  }));
  return { coaches, total, page, limit };
};

const getCoachById = async (id: number) => {
  return prisma.coaches.findUnique({
    where: { id },
    select: {
      email: true,
      email_verified: true,
    },
  });
};

const getCoachDetails = async (id: number) => {
  return prisma.coaches.findUnique({
    where: { id },
    select: {
      first_name: true,
      last_name: true,
      email: true,
      phone: true,
      role: true,
      permission_level: true,
    },
  });
};

const getCoachTeams = async (id: number) => {
  return prisma.coaches.findUnique({
    where: { id },
    select: {
      teams: {
        select: {
          team: {
            select: {
              id: true,
              name: true,
              age_group: true,
              logo: true,
            },
          },
        },
      },
    },
  });
};

const assignTeam = async (coachId: number, teamId: number) => {
  return prisma.teamCoaches.create({
    data: {
      coach_id: coachId,
      team_id: teamId,
    },
  });
};

const removeTeam = async (coachId: number, teamId: number) => {
  return prisma.teamCoaches.delete({
    where: {
      team_id_coach_id: {
        coach_id: coachId,
        team_id: teamId,
      },
    },
  });
};

const getTeamCoach = async (coachId: number, teamId: number) => {
  return prisma.teamCoaches.findUnique({
    where: {
      team_id_coach_id: {
        coach_id: coachId,
        team_id: teamId,
      },
    },
  });
};

const deleteCoach = async (id: number) => {
  return prisma.$transaction(async (tx) => {
    await tx.teamCoaches.deleteMany({
      where: { coach_id: id },
    });

    return tx.coaches.delete({
      where: { id },
    });
  });
};

export default {
  getCoachByEmail,
  createOrUpdateCoachInvitation,
  getCoaches,
  getCoachDetails,
  getCoachTeams,
  assignTeam,
  removeTeam,
  getTeamCoach,
  getCoachById,
  deleteCoach,
};
