import crypto from "crypto";
import prisma from "../../lib/prisma";
import { expandEvent } from "../../utils/event";

const generateUniqueCode = () => {
  return crypto.randomBytes(3).toString("hex").toUpperCase();
};

const createTeam = async (
  team_name: string,
  age_group: string,
  coach_ids: number[],
) => {
  let uniqueCode = generateUniqueCode();

  const existing = await prisma.teams.findUnique({
    where: { unique_code: uniqueCode },
  });
  if (existing) {
    uniqueCode = generateUniqueCode();
  }

  return prisma.teams.create({
    data: {
      name: team_name,
      age_group,
      unique_code: uniqueCode,
      coaches: coach_ids
        ? {
            create: coach_ids.map((id) => ({
              coach: { connect: { id } },
            })),
          }
        : undefined,
    },
    select: {
      id: true,
      name: true,
      age_group: true,
      unique_code: true,
      createdAt: true,
      updatedAt: true,
      coaches: {
        select: {
          coach: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
            },
          },
        },
      },
    },
  });
};

const getTeams = async (page: number, limit: number) => {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    prisma.teams.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        age_group: true,
        unique_code: true,
        createdAt: true,
        updatedAt: true,
        players: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
          },
        },
        coaches: {
          select: {
            coach: {
              select: {
                id: true,
                profile_picture: true,
                first_name: true,
                last_name: true,
              },
            },
          },
        },
      },
    }),
    prisma.teams.count(),
  ]);

  return { teams: data, total, page, limit };
};

const getTeamById = async (id: number) => {
  return prisma.teams.findUnique({
    where: { id },
    select: {
      id: true,
      unique_code: true,
    },
  });
};

const getTeamDetails = async (id: number) => {
  const team = await prisma.teams.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      age_group: true,
      unique_code: true,
      createdAt: true,
      updatedAt: true,
      players: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          jersey_number: true,
          positions: true,
          height: true,
          weight: true,
        },
      },
      coaches: {
        select: {
          coach: {
            select: {
              id: true,
              profile_picture: true,
              first_name: true,
              last_name: true,
              role: true,
              email: true,
              phone: true,
            },
          },
        },
      },
      events: {
        where: {
          OR: [
            {
              is_recurring: false,
              start_date: {
                gte: new Date(),
              },
            },
            {
              is_recurring: true,
              OR: [
                { end_recurrence_date: null },
                { end_recurrence_date: { gte: new Date() } },
              ],
            },
          ],
        },
        select: {
          id: true,
          event_type: true,
          name: true,
          start_date: true,
          start_time: true,
          end_time: true,
          location: true,
          address: true,
          is_recurring: true,
          repeat_pattern: true,
          repeat_days: true,
          end_recurrence_date: true,
          end_recurrence_count: true,
          coaches: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              profile_picture: true,
            },
          },
        },
      },
    },
  });

  if (!team) return null;

  const { events, ...teamData } = team;
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const endLimit = new Date();
  endLimit.setFullYear(endLimit.getFullYear() + 1);

  let expandedEvents: any[] = [];

  events.forEach((event) => {
    const instances = expandEvent(event, now, endLimit);
    instances.forEach((instance) => {
      expandedEvents.push({
        id: instance.id,
        name: instance.name,
        event_type: instance.event_type,
        start_date: instance.start_date,
        start_time: instance.start_time,
        end_time: instance.end_time,
        location: instance.location,
        address: instance.address,
        coaches: instance.coaches,
      });
    });
  });

  expandedEvents.sort(
    (a, b) => a.start_date.getTime() - b.start_date.getTime(),
  );

  return {
    ...teamData,
    events: expandedEvents,
  };
};

const updateTeam = async (
  id: number,
  team_name: string,
  age_group: string,
  coach_ids: number[],
) => {
  return prisma.teams.update({
    where: { id },
    data: {
      name: team_name,
      age_group,
      coaches: coach_ids
        ? {
            deleteMany: {},
            create: coach_ids.map((cId) => ({
              coach: { connect: { id: cId } },
            })),
          }
        : undefined,
    },
  });
};

const deleteTeam = async (id: number) => {
  return prisma.teams.delete({
    where: { id },
  });
};

export default {
  createTeam,
  getTeams,
  getTeamById,
  getTeamDetails,
  updateTeam,
  deleteTeam,
};
