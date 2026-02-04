import prisma from "../../lib/prisma";

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
  getCoachPlayers,
  checkPlayerAccess,
};
