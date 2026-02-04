import { expandEvent } from "../../utils/event";
import prisma from "../../lib/prisma";

const checkEventAccess = async (coachId: number, eventId: number) => {
  const event = await prisma.events.findUnique({
    where: { id: eventId },
    select: { team_id: true },
  });

  if (!event) return false;

  const access = await prisma.teamCoaches.findUnique({
    where: {
      team_id_coach_id: {
        coach_id: coachId,
        team_id: event.team_id,
      },
    },
  });

  return !!access;
};

const getCoachEvents = async (
  coachId: number,
  teamId?: number,
  date?: Date,
) => {
  const coachTeams = await prisma.teamCoaches.findMany({
    where: { coach_id: coachId },
    select: { team_id: true },
  });

  const teamIds = coachTeams.map((ct) => ct.team_id);

  if (teamId && !teamIds.includes(teamId)) {
    return { today_events: [], monthly_events: [] };
  }

  const targetDate = date ? new Date(date) : new Date();
  const startOfMonth = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    1,
  );
  const endOfMonth = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth() + 1,
    0,
  );
  endOfMonth.setHours(23, 59, 59, 999);

  const whereClause: any = {
    team_id: teamId ? teamId : { in: teamIds },
  };

  const potentialEvents = await prisma.events.findMany({
    where: {
      ...whereClause,
      OR: [
        {
          is_recurring: false,
          start_date: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        {
          is_recurring: true,
          start_date: {
            lte: endOfMonth,
          },
          OR: [
            { end_recurrence_date: null },
            { end_recurrence_date: { gte: startOfMonth } },
          ],
        },
      ],
    },
    include: {
      team: {
        select: {
          id: true,
          name: true,
          logo: true,
        },
      },
      coaches: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          profile_picture: true,
        },
      },
    },
    orderBy: { start_date: "asc" },
  });

  let monthlyEventsExpanded: any[] = [];

  potentialEvents.forEach((event) => {
    const instances = expandEvent(event, startOfMonth, endOfMonth);
    monthlyEventsExpanded = [...monthlyEventsExpanded, ...instances];
  });

  monthlyEventsExpanded.sort(
    (a, b) => a.start_date.getTime() - b.start_date.getTime(),
  );

  const startOfToday = new Date(targetDate);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(targetDate);
  endOfToday.setHours(23, 59, 59, 999);

  const today_events = monthlyEventsExpanded.filter((event) => {
    return event.start_date >= startOfToday && event.start_date <= endOfToday;
  });

  const formatEvent = (e: any) => ({
    id: e.id,
    name: e.name,
    event_type: e.event_type,
    start_date: e.start_date,
    start_time: e.start_time,
    end_time: e.end_time,
    location: e.location,
    address: e.address,
    team: e.team,
    coaches: e.coaches,
    is_recurring: e.is_recurring,
  });

  return {
    today_events: today_events.map(formatEvent),
    monthly_events: monthlyEventsExpanded.map(formatEvent),
  };
};

export default {
  checkEventAccess,
  getCoachEvents,
};
