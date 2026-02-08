import prisma from "../../lib/prisma";
import { expandEvent } from "../../utils/event";
import { CreateEvent, UpdateEvent } from "../../interface/admin/event";

const createEvent = async (eventData: CreateEvent) => {
  const { coach_ids, ...data } = eventData;

  return prisma.events.create({
    data: {
      ...data,
      coaches: {
        connect: coach_ids.map((id) => ({ id })),
      },
    },
    include: {
      team: {
        select: {
          id: true,
          name: true,
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
  });
};

const getEvents = async (teamId?: number, date?: Date) => {
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

  const whereClause: any = {};

  if (teamId) {
    whereClause.team_id = teamId;
  }

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
    return (
      event.start_date >= startOfToday && event.start_date <= endOfToday
    );
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

const getEventById = async (id: number) => {
  const event = await prisma.events.findUnique({
    where: { id },
    include: {
      coaches: {
        select: { id: true },
      },
    },
  });

  if (!event) return null;

  const { coaches, ...rest } = event;

  return {
    ...rest,
    coachIds: coaches.map((c) => c.id),
  };
};

const updateEvent = async (id: number, eventData: UpdateEvent) => {
  const { coach_ids, ...data } = eventData;

  return prisma.events.update({
    where: { id },
    data: {
      ...data,
      coaches: coach_ids
        ? {
            set: coach_ids.map((cid) => ({ id: cid })),
          }
        : undefined,
    },
    include: {
      team: {
        select: {
          id: true,
          name: true,
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
  });
};

const updateEventCoaches = async (id: number, coachIds: number[]) => {
  return prisma.events.update({
    where: { id },
    data: {
      coaches: {
        set: coachIds.map((cid) => ({ id: cid })),
      },
    },
    include: {
      coaches: {
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

const deleteEvent = async (id: number) => {
  return prisma.events.delete({
    where: { id },
  });
};

const getTimesheet = async (
  startDate: Date,
  endDate: Date,
  coachId?: number,
) => {
  const whereClause: any = {};
  if (coachId) {
    whereClause.id = coachId;
  }

  const coaches = await prisma.coaches.findMany({
    where: whereClause,
    select: {
      id: true,
      first_name: true,
      last_name: true,
      email: true,
      profile_picture: true,
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
          notes: true,
          is_recurring: true,
          repeat_pattern: true,
          repeat_days: true,
          end_recurrence_date: true,
          end_recurrence_count: true,
        },
      },
    },
  });

  const calculateHours = (start: string, end: string) => {
    const d1 = new Date(`2000-01-01 ${start}`);
    const d2 = new Date(`2000-01-01 ${end}`);
    const diff = (d2.getTime() - d1.getTime()) / (1000 * 60 * 60);
    return diff > 0 ? diff : 0;
  };

  const result: any[] = [];

  coaches.forEach((coach) => {
    coach.events.forEach((event) => {
      const instances = expandEvent(event, startDate, endDate);

      instances.forEach((instance) => {
        result.push({
          id: instance.id,
          date: instance.start_date,
          event_type: instance.event_type,
          name: instance.name,
          start_time: instance.start_time,
          end_time: instance.end_time,
          total_hours: calculateHours(instance.start_time, instance.end_time),
          notes: instance.notes,
          coach: {
            id: coach.id,
            first_name: coach.first_name,
            last_name: coach.last_name,
            email: coach.email,
            profile_picture: coach.profile_picture,
          },
        });
      });
    });
  });

  result.sort((a, b) => a.date.getTime() - b.date.getTime());

  return result;
};

export default {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  updateEventCoaches,
  deleteEvent,
  getTimesheet,
};
