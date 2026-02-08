import prisma from "../../lib/prisma";
import { expandEvent } from "../../utils/event";

const getPlayerTeam = async (playerId: number) => {
  return prisma.players.findUnique({
    where: { id: playerId },
    select: {
      team: {
        select: {
          id: true,
          name: true,
          unique_code: true,
        },
      },
    },
  });
};

const getPlayerTeamsheet = async (
  teamId: number,
  startDate: Date,
  endDate: Date
) => {
  const team = await prisma.teams.findUnique({
    where: { id: teamId },
    select: {
      id: true,
      name: true,
      age_group: true,
      unique_code: true,
      team_pictures_url: true,
      coaches: {
        select: {
          coach: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
              profile_picture: true,
              role: true,
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
                gte: startDate,
                lte: endDate,
              },
            },
            {
              is_recurring: true,
              OR: [
                { end_recurrence_date: null },
                { end_recurrence_date: { gte: startDate } },
              ],
              start_date: {
                lte: endDate,
              },
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
          notes: true,
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

  const calculateHours = (start: string, end: string) => {
    const d1 = new Date(`2000-01-01 ${start}`);
    const d2 = new Date(`2000-01-01 ${end}`);
    const diff = (d2.getTime() - d1.getTime()) / (1000 * 60 * 60);
    return diff > 0 ? diff : 0;
  };

  const teamsheet: any[] = [];

  team.events.forEach((event) => {
    const instances = expandEvent(event, startDate, endDate);

    instances.forEach((instance) => {
      teamsheet.push({
        id: instance.id,
        date: instance.start_date,
        event_type: instance.event_type,
        name: instance.name,
        start_time: instance.start_time,
        end_time: instance.end_time,
        location: instance.location,
        address: instance.address,
        total_hours: calculateHours(instance.start_time, instance.end_time),
        notes: instance.notes,
        coaches: instance.coaches,
      });
    });
  });

  teamsheet.sort((a, b) => a.date.getTime() - b.date.getTime());

  return {
    team: {
      id: team.id,
      name: team.name,
      age_group: team.age_group,
      unique_code: team.unique_code,
      team_pictures_url: team.team_pictures_url,
    },
    coaches: team.coaches.map((c) => c.coach),
    teamsheet,
  };
};

const getTeammates = async (teamId: number) => {
  return prisma.players.findMany({
    where: { team_id: teamId },
    select: {
      id: true,
      profile_picture: true,
      first_name: true,
      last_name: true,
      high_school_class: true,
    },
    orderBy: [
      { first_name: 'asc' },
    ],
  });
};

export default {
  getPlayerTeam,
  getPlayerTeamsheet,
  getTeammates,
};
