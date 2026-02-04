import { Request, Response } from "express";
import { asyncHandler } from "../../middleware/errorHandler";
import eventQueries from "../../queries/admin/event";
import teamQueries from "../../queries/admin/team";
import coachQueries from "../../queries/coach/auth";

export const createEvent = asyncHandler(async (req: Request, res: Response) => {
  const eventData = req.body;

  const existingTeam = await teamQueries.getTeamById(eventData.team_id);
  if (!existingTeam) {
    return res.status(404).json({
      message: "Team not found",
      response: null,
      error: "Team not found",
    });
  }

  if (eventData.coach_ids && eventData.coach_ids.length > 0) {
    const allCoachesExist = await coachQueries.checkCoachesExist(
      eventData.coach_ids,
    );
    if (!allCoachesExist) {
      return res.status(404).json({
        message: "One or more coaches not found",
        response: null,
        error: "One or more coaches not found",
      });
    }
  }

  const result = await eventQueries.createEvent(eventData);

  return res.status(201).json({
    message: "Event created successfully",
    response: {
      data: result,
    },
    error: null,
  });
});

export const getEvents = asyncHandler(async (req: Request, res: Response) => {
  const teamId = req.query.teamId
    ? parseInt(req.query.teamId as string)
    : undefined;
  const targetDate = req.query.date
    ? new Date(req.query.date as string)
    : undefined;

  const result = await eventQueries.getEvents(teamId, targetDate);

  return res.status(200).json({
    message: "Events fetched successfully",
    response: {
      data: result,
    },
    error: null,
  });
});

export const getTimesheet = asyncHandler(
  async (req: Request, res: Response) => {
    const { period, startDate, endDate, coachId } = req.query;

    let start: Date;
    let end: Date;

    const now = new Date();

    if (period === "this_week" || (!period && !startDate)) {
      const day = now.getDay();
      const diff = now.getDate() - day;
      start = new Date(now.setDate(diff));
      start.setHours(0, 0, 0, 0);

      end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
    } else if (period === "this_month") {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
    } else if (period === "custom" && startDate && endDate) {
      start = new Date(startDate as string);
      end = new Date(endDate as string);
      end.setHours(23, 59, 59, 999);
    } else {
      const day = now.getDay();
      const diff = now.getDate() - day;
      start = new Date(now.setDate(diff));
      start.setHours(0, 0, 0, 0);
      end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
    }

    const cId = coachId ? parseInt(coachId as string) : undefined;
    const result = await eventQueries.getTimesheet(start, end, cId);

    let totalHourlyHours = 0;
    const hoursByType: Record<string, number> = {};
    const activeCoachesSet = new Set<number>();

    result.forEach((item: any) => {
      totalHourlyHours += item.total_hours;
      const type = item.event_type || "Other";
      hoursByType[type] = (hoursByType[type] || 0) + item.total_hours;

      if (item.coach && item.coach.id) {
        activeCoachesSet.add(item.coach.id);
      }
    });

    const activeCoachesCount = activeCoachesSet.size;
    const avgHourlyHours =
      activeCoachesCount > 0
        ? parseFloat((totalHourlyHours / activeCoachesCount).toFixed(1))
        : 0;

    const typeBreakdown = Object.entries(hoursByType)
      .map(([type, hours]) => `${type}: ${hours.toFixed(1)}h`)
      .join(" • ");

    return res.status(200).json({
      message: "Timesheet fetched successfully",
      response: {
        data: {
          timesheet: result,
          total_hourly_hours: parseFloat(totalHourlyHours.toFixed(1)),
          breakdown: typeBreakdown,
          active_coaches: activeCoachesCount,
          avg_hourly_hours: avgHourlyHours,
        },
      },
      error: null,
    });
  },
);

export const getEventById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const event = await eventQueries.getEventById(parseInt(id));
    if (!event) {
      return res.status(404).json({
        message: "Event not found",
        response: null,
        error: "Event not found",
      });
    }

    return res.status(200).json({
      message: "Event fetched successfully",
      response: {
        data: event,
      },
      error: null,
    });
  },
);

export const updateEvent = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const eventData = req.body;

  const existingEvent = await eventQueries.getEventById(parseInt(id));
  if (!existingEvent) {
    return res.status(404).json({
      message: "Event not found",
      response: null,
      error: "Event not found",
    });
  }

  if (eventData.team_id) {
    const existingTeam = await teamQueries.getTeamById(eventData.team_id);
    if (!existingTeam) {
      return res.status(404).json({
        message: "Team not found",
        response: null,
        error: "Team not found",
      });
    }
  }

  if (eventData.coach_ids && eventData.coach_ids.length > 0) {
    const allCoachesExist = await coachQueries.checkCoachesExist(
      eventData.coach_ids,
    );
    if (!allCoachesExist) {
      return res.status(404).json({
        message: "One or more coaches not found",
        response: null,
        error: "One or more coaches not found",
      });
    }
  }

  const result = await eventQueries.updateEvent(parseInt(id), eventData);

  return res.status(200).json({
    message: "Event updated successfully",
    response: {
      data: result,
    },
    error: null,
  });
});

export const updateEventCoaches = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { coach_ids } = req.body;

    const existingEvent = await eventQueries.getEventById(parseInt(id));
    if (!existingEvent) {
      return res.status(404).json({
        message: "Event not found",
        response: null,
        error: "Event not found",
      });
    }

    if (coach_ids && coach_ids.length > 0) {
      const allCoachesExist = await coachQueries.checkCoachesExist(coach_ids);
      if (!allCoachesExist) {
        return res.status(404).json({
          message: "One or more coaches not found",
          response: null,
          error: "One or more coaches not found",
        });
      }
    }

    const result = await eventQueries.updateEventCoaches(
      parseInt(id),
      coach_ids,
    );

    return res.status(200).json({
      message: "Event coaches updated successfully",
      response: {
        data: result.coaches,
      },
      error: null,
    });
  },
);

export const deleteEvent = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const existingEvent = await eventQueries.getEventById(parseInt(id));
  if (!existingEvent) {
    return res.status(404).json({
      message: "Event not found",
      response: null,
      error: "Event not found",
    });
  }

  await eventQueries.deleteEvent(parseInt(id));

  return res.status(200).json({
    message: "Event deleted successfully",
    response: null,
    error: null,
  });
});
