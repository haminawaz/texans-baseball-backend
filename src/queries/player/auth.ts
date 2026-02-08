import prisma from "../../lib/prisma";
import {
  RegisterPlayer,
  UpdatePlayer,
  ForgotPassword,
  ResetPassword,
} from "../../interface/player/auth";

const getTeamByCode = async (code: string) => {
  return prisma.teams.findUnique({
    where: { unique_code: code },
    select: {
      id: true,
    },
  });
};

const getPlayerByEmail = async (email: string) => {
  return prisma.players.findUnique({
    where: { email },
    select: {
      id: true,
      email_verified: true,
      email_verification_expires_at: true,
    },
  });
};

const getPlayerById = async (id: number) => {
  return prisma.players.findUnique({
    where: { id },
    select: {
      id: true,
      team_id: true,
      email_verified: true,
      profile_picture: true,
      hero_image: true,
    },
  });
};

const getPlayerForJwt = async (email: string) => {
  return prisma.players.findUnique({
    where: { email },
    select: {
      id: true,
      email_verified: true,
    },
  });
};

const getPlayerWithPassword = async (email: string) => {
  return prisma.players.findUnique({
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

const updateLastLogin = async (playerId: number) => {
  return prisma.players.update({
    where: { id: playerId },
    data: {
      last_login_at: new Date(),
    },
  });
};

const createOrUpdatePlayerTransaction = async (playerData: RegisterPlayer) => {
  return prisma.$transaction(async (tx) => {
    return tx.players.upsert({
      where: { email: playerData.email },
      update: {
        first_name: playerData.first_name,
        last_name: playerData.last_name,
        password: playerData.password,
        team_id: playerData.team_id,
        email_verification_otp: playerData.email_verification_otp,
        email_verification_expires_at: playerData.email_verification_otp_expiry,
      },
      create: {
        first_name: playerData.first_name,
        last_name: playerData.last_name,
        email: playerData.email,
        password: playerData.password,
        team_id: playerData.team_id,
        email_verification_otp: playerData.email_verification_otp,
        email_verification_expires_at: playerData.email_verification_otp_expiry,
      },
    });
  });
};

const verifyPlayerEmail = async (email: string, otp: string) => {
  try {
    const result = await prisma.players.update({
      where: {
        email,
        email_verification_otp: otp,
        email_verified: false,
        email_verification_expires_at: { gt: new Date() },
      },
      data: {
        email_verified: true,
        email_verification_otp: null,
        email_verification_expires_at: null,
      },
    });

    return result;
  } catch (error) {
    return null;
  }
};

const getJerseyNumber = async (playerId: number, jerseyNumber: number) => {
  return prisma.players.findFirst({
    where: { jersey_number: jerseyNumber, id: { not: playerId } },
    select: {
      id: true,
    },
  });
};

const updateProfile = async (playerData: UpdatePlayer) => {
  const { player_id, ...rest } = playerData;

  return prisma.players.update({
    where: { id: player_id },
    data: {
      ...(rest as any),
    },
  });
};

const getPlayerProfile = async (playerId: number) => {
  const player = await prisma.players.findUnique({
    where: { id: playerId },
    select: {
      id: true,
      email: true,
      first_name: true,
      last_name: true,
      phone: true,
      profile_picture: true,
      hero_image: true,
      date_of_birth: true,
      age: true,
      high_school_class: true,
      positions: true,
      jersey_number: true,
      bat_hand: true,
      throw_hand: true,
      height: true,
      weight: true,
      high_school: true,
      sat_score: true,
      act_score: true,
      gpa: true,
      commited_school: true,
      x_handle: true,
      instagram_handle: true,
      facebook_handle: true,
      guardians: true,
    },
  });

  if (!player) return null;

  return {
    general: {
      id: player.id,
      email: player.email,
      first_name: player.first_name,
      last_name: player.last_name,
      phone: player.phone,
      profile_picture: player.profile_picture,
      hero_image: player.hero_image,
      x_handle: player.x_handle,
      instagram_handle: player.instagram_handle,
      facebook_handle: player.facebook_handle,
      positions: player.positions,
      jersey_number: player.jersey_number,
      height: player.height,
      weight: player.weight,
      date_of_birth: player.date_of_birth,
      age: player.age,
      bat_hand: player.bat_hand,
      throw_hand: player.throw_hand,
    },
    academic: {
      high_school_class: player.high_school_class,
      high_school: player.high_school,
      sat_score: player.sat_score,
      act_score: player.act_score,
      gpa: player.gpa,
      commited_school: player.commited_school,
    },
    guardians: player.guardians,
  };
};

const getPlayerPassword = async (playerId: number) => {
  return prisma.players.findUnique({
    where: { id: playerId },
    select: {
      password: true,
    },
  });
};

const updatePassword = async (playerId: number, password: string) => {
  return prisma.players.update({
    where: { id: playerId },
    data: {
      password: password,
    },
  });
};

const forgotPassword = async (forgotPassword: ForgotPassword) => {
  return prisma.players.update({
    where: { id: forgotPassword.player_id },
    data: {
      reset_password_otp: forgotPassword.reset_password_otp,
      reset_password_expires_at: forgotPassword.reset_password_otp_expiry,
    },
    select: {
      first_name: true,
      last_name: true,
    },
  });
};

const resetPassword = async (resetPassword: ResetPassword) => {
  try {
    const result = await prisma.players.update({
      where: {
        id: resetPassword.player_id,
        reset_password_otp: resetPassword.otp,
        reset_password_expires_at: { gt: new Date() },
      },
      data: {
        password: resetPassword.new_password,
        reset_password_otp: null,
        reset_password_expires_at: null,
      },
    });

    return result;
  } catch (error) {
    return null;
  }
};

const getAllPlayers = async (
  name?: string,
  teamId?: number,
  position?: string
) => {
  const where: any = {};

  if (name) {
    where.OR = [
      { first_name: { contains: name, mode: "insensitive" } },
      { last_name: { contains: name, mode: "insensitive" } },
    ];
  }

  if (teamId) {
    where.team_id = teamId;
  }

  if (position) {
    where.positions = { has: position };
  }

  const [data, total] = await Promise.all([
    prisma.players.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        profile_picture: true,
        jersey_number: true,
        age: true,
        positions: true,
        email: true,
        phone: true,
        weight: true,
        height: true,
        high_school: true,
        high_school_class: true,
        sat_score: true,
        act_score: true,
        gpa: true,
        commited_school: true,
      },
    }),
    prisma.players.count({ where }),
  ]);

  const formattedPlayers = data.map((player) => ({
    id: player.id,
    first_name: player.first_name,
    last_name: player.last_name,
    profile_picture: player.profile_picture,
    jersey_number: player.jersey_number,
    age: player.age,
    positions: player.positions,
    email: player.email,
    phone: player.phone,
    physical: [
      { weight: player.weight },
      { height: player.height },
    ],
    school_info: {
      high_school: player.high_school,
      high_school_class: player.high_school_class,
      sat_score: player.sat_score,
      act_score: player.act_score,
      gpa: player.gpa,
      commited_school: player.commited_school,
    },
  }));

  return { players: formattedPlayers, total };
};

const deletePlayer = async (id: number) => {
  return prisma.players.delete({
    where: { id },
  });
};

const getUsedJerseyNumbers = async (teamId: number) => {
  const players = await prisma.players.findMany({
    where: { team_id: teamId },
    select: { jersey_number: true },
  });
  return players
    .map((p) => p.jersey_number)
    .filter((n): n is number => n !== null);
};

const assignPlayerToTeam = async (playerId: number, newTeamId: number) => {
  const player = await prisma.players.findUnique({
    where: { id: playerId },
    select: { jersey_number: true },
  });

  if (!player) return null;

  const usedNumbers = await getUsedJerseyNumbers(newTeamId);
  let finalJerseyNumber = player.jersey_number;

  if (finalJerseyNumber !== null && usedNumbers.includes(finalJerseyNumber)) {
    for (let i = 0; i <= 99; i++) {
      if (!usedNumbers.includes(i)) {
        finalJerseyNumber = i;
        break;
      }
    }
  }

  return prisma.players.update({
    where: { id: playerId },
    data: {
      team_id: newTeamId,
      jersey_number: finalJerseyNumber,
    },
  });
};

export default {
  getTeamByCode,
  getPlayerByEmail,
  getPlayerById,
  getPlayerForJwt,
  getPlayerWithPassword,
  updateLastLogin,
  createOrUpdatePlayerTransaction,
  verifyPlayerEmail,
  getPlayerProfile,
  getJerseyNumber,
  updateProfile,
  getPlayerPassword,
  updatePassword,
  forgotPassword,
  resetPassword,
  getAllPlayers,
  deletePlayer,
  assignPlayerToTeam,
};
