import prisma from "../../lib/prisma";
import { CreateParent, CreatePlayerParent } from "../../interface/parent/auth";

const getParentByEmail = async (email: string) => {
  return prisma.parents.findUnique({
    where: { email },
    select: {
      id: true,
      first_name: true,
      last_name: true,
      email: true,
      email_verified: true,
    },
  });
};

const getParentLink = async (playerId: number, parentId: number) => {
  return prisma.playerParents.findUnique({
    where: {
      player_id_parent_id: {
        player_id: playerId,
        parent_id: parentId,
      },
    },
    select: {
      relationship: true,
      invitation_status: true,
    },
  });
};

const createParent = async (player_id: number, data: CreateParent) => {
  const parent = await prisma.parents.create({
    data: {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      password: "",
    },
  });

  await prisma.playerParents.create({
    data: {
      player_id: player_id,
      parent_id: parent.id,
      relationship: data.relationship,
      invitation_token: data.invitation_token,
      invitation_expires_at: data.invitation_expires_at,
      invitation_status: "pending",
    },
  });

  return {
    id: parent.id,
    first_name: parent.first_name,
    last_name: parent.last_name,
    email: parent.email,
    email_verified: parent.email_verified,
  };
};

const createPlayerParent = async (data: CreatePlayerParent) => {
  return prisma.playerParents.update({
    where: {
      player_id_parent_id: {
        player_id: data.player_id,
        parent_id: data.parent_id,
      },
    },
    data: {
      relationship: data.relationship,
      invitation_token: data.invitation_token,
      invitation_expires_at: data.invitation_expires_at,
      invitation_status: "pending",
    },
  });
};

const getParentLinksForPlayer = async (playerId: number) => {
  return prisma.playerParents.findMany({
    where: { player_id: playerId },
    select: {
      relationship: true,
      invitation_status: true,
      parent: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
        },
      },
    },
  });
};

const removeParentLink = async (playerId: number, parentId: number) => {
  return prisma.playerParents.delete({
    where: {
      player_id_parent_id: {
        player_id: playerId,
        parent_id: parentId,
      },
    },
  });
};

export default {
  getParentByEmail,
  getParentLink,
  createParent,
  createPlayerParent,
  getParentLinksForPlayer,
  removeParentLink,
};
