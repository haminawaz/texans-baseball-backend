import prisma from "../../lib/prisma";
import { ForgotPassword, ParentSignup, ResetPassword } from "../../interface/parent/auth";

const getParentForJwt = async (email: string) => {
  return prisma.parents.findUnique({
    where: { email },
    select: {
      id: true,
      email_verified: true,
    },
  });
};

const getPlayersByTeamCode = async (teamCode: string) => {
  const team = await prisma.teams.findUnique({
    where: { unique_code: teamCode },
    select: { id: true },
  });

  if (!team) return null;

  return prisma.players.findMany({
    where: { team_id: team.id },
    select: {
      id: true,
      first_name: true,
      last_name: true,
      profile_picture: true,
    },
  });
};

const getParentWithPassword = async (email: string) => {
  return prisma.parents.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      first_name: true,
      last_name: true,
      password: true,
      email_verified: true,
    },
  });
};

const parentSignup = async (data: ParentSignup) => {
  const parent = await prisma.parents.create({
    data: {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      password: data.password,
      email_verification_otp: data.email_verification_otp,
      email_verification_expires_at: data.email_verification_expires_at,
    },
  });

  return await prisma.playerParents.create({
    data: {
      player_id: data.player_id,
      parent_id: parent.id,
      relationship: data.relationship,
      invitation_status: "accepted",
    },
  });
};

const verifyPlayerEmail = async (email: string, otp: string) => {
  try {
    console.log("email", email);
    console.log("otp", otp);
    const result = await prisma.parents.update({
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

const forgotPassword = async (data: ForgotPassword) => {
  return prisma.parents.update({
    where: { id: data.parent_id },
    data: {
      reset_password_otp: data.reset_password_otp,
      reset_password_expires_at: data.reset_password_otp_expiry,
    },
  });
};

const resetPassword = async (data: ResetPassword) => {
  try {
    const result = await prisma.parents.update({
      where: {
        id: data.parent_id,
        reset_password_otp: data.otp,
        reset_password_expires_at: { gt: new Date() },
      },
      data: {
        password: data.new_password,
        reset_password_otp: null,
        reset_password_expires_at: null,
        ...(data.verify_email && { email_verified: true }),
      },
    });
    return result;
  } catch (error) {
    return null;
  }
};

const getPlayerParentByToken = async (token: string) => {
  return prisma.playerParents.findFirst({
    where: { invitation_token: token },
    select: {
      player_id: true,
      parent_id: true,
      invitation_expires_at: true,
      parent: {
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          email_verified: true,
        },
      },
    },
  });
};

const acceptInvitation = async (playerId: number, parentId: number) => {
  return prisma.playerParents.update({
    where: {
      player_id_parent_id: {
        player_id: playerId,
        parent_id: parentId,
      },
    },
    data: {
      invitation_status: "accepted",
      invitation_token: null,
      invitation_expires_at: null,
    },
  });
};

const getPlayersForParent = async (parentId: number) => {
  return prisma.playerParents.findMany({
    where: { parent_id: parentId },
    select: {
      relationship: true,
      invitation_status: true,
      player: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          profile_picture: true,
        },
      },
    },
  });
};

export default {
  getParentForJwt,
  getPlayersByTeamCode,
  getParentWithPassword,
  parentSignup,
  verifyPlayerEmail,
  forgotPassword,
  resetPassword,
  getPlayerParentByToken,
  acceptInvitation,
  getPlayersForParent,
};
