import prisma from "../../lib/prisma";

const checkTryoutAccess = async (coachId: number, tryoutId: number) => {
  const tryout = await prisma.tryouts.findUnique({
    where: { id: tryoutId },
    select: { team_id: true },
  });

  if (!tryout) return false;

  const access = await prisma.teamCoaches.findUnique({
    where: {
      team_id_coach_id: {
        coach_id: coachId,
        team_id: tryout.team_id,
      },
    },
  });

  return !!access;
};

const getCoachTryouts = async (coachId: number, page: number, limit: number) => {
  const skip = (page - 1) * limit;

  const coachTeams = await prisma.teamCoaches.findMany({
    where: { coach_id: coachId },
    select: { team_id: true },
  });

  const teamIds = coachTeams.map((ct) => ct.team_id);

  const [data, total] = await Promise.all([
    prisma.tryouts.findMany({
      where: {
        team_id: { in: teamIds },
      },
      select: {
        id: true,
        name: true,
        date: true,
        time: true,
        address: true,
        registration_deadline: true,
        team: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
      orderBy: { date: "asc" },
      skip,
      take: limit,
    }),
    prisma.tryouts.count({
      where: {
        team_id: { in: teamIds },
      },
    }),
  ]);

  return { tryouts: data, total, page, limit };
};

export default {
  checkTryoutAccess,
  getCoachTryouts,
};
