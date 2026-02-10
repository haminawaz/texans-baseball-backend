import prisma from "../../lib/prisma";
import { PlayerUniformSizing } from "../../interface/player/uniform-sizing";
import { CoachUniformSizing } from "../../interface/coach/uniform-sizing";

const getAllCoachesUniformSizing = async (name?: string, teamId?: number) => {
  const where: any = {};

  if (name) {
    where.OR = [
      { first_name: { contains: name, mode: "insensitive" } },
      { last_name: { contains: name, mode: "insensitive" } },
    ];
  }

  if (teamId) {
    where.teams = {
      some: {
        team_id: teamId,
      },
    };
  }

  const coaches = await prisma.coaches.findMany({
    where,
    select: {
      id: true,
      first_name: true,
      last_name: true,
      profile_picture: true,
      teams: {
        select: {
          team: {
            select: {
              name: true,
            },
          },
        },
      },
      uniform_sizing: {
        select: {
          hat_size: true,
          shirt_size: true,
          short_size: true,
          long_sleeves: true,
          hoodie_size: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return coaches.map((coach) => ({
    ...coach,
    teams: coach.teams.map((t) => t.team),
  }));
};

const updateCoachUniformSizing = async (data: CoachUniformSizing) => {
  const { coach_id, ...rest } = data;

  return prisma.coachUniformSizing.upsert({
    where: { coach_id },
    update: {
      ...rest,
    },
    create: {
      coach_id,
      ...rest,
    },
  });
};

const getAllPlayersUniformSizing = async (name?: string, teamId?: number) => {
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

  return await prisma.players.findMany({
    where,
    select: {
      id: true,
      first_name: true,
      last_name: true,
      profile_picture: true,
      team: {
        select: {
          name: true,
        },
      },
      uniform_sizing: {
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
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const updatePlayerUniformSizing = async (data: PlayerUniformSizing) => {
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
  getAllCoachesUniformSizing,
  updateCoachUniformSizing,
  getAllPlayersUniformSizing,
  updatePlayerUniformSizing,
};
