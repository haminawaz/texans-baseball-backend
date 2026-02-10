import prisma from "../../lib/prisma";
import { PlayerUniformSizing } from "../../interface/player/uniform-sizing";

const getUniformSizing = async (playerId: number) => {
  return prisma.playerUniformSizing.findUnique({
    where: { player_id: playerId },
    select: {
      jersey_size: true,
      hat_size: true,
      helmet_size: true,
      helmet_side: true,
      jersey_pants: true,
      pant_style: true,
      shirt_size: true,
      short_size: true,
      youth_belt: true,
      adult_belt: true,
      sock_size: true,
      shoe_size: true,
      sweater_jacket: true,
      is_catcher: true,
      batting_glove: true,
    },
  });
};

const updateUniformSizing = async (data: PlayerUniformSizing) => {
  const { player_id, ...rest } = data;

  return prisma.playerUniformSizing.upsert({
    where: { player_id },
    update: {
      ...rest,
    },
    create: {
      player_id,
      ...rest,
    },
  });
};

export default {
  getUniformSizing,
  updateUniformSizing,
};
