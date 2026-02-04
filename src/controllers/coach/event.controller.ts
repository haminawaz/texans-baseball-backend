import { Request, Response } from "express";
import { asyncHandler } from "../../middleware/errorHandler";
import eventQueries from "../../queries/admin/event";
import coachEventQueries from "../../queries/coach/event";
import coachAuthQueries from "../../queries/coach/auth";

export const createEvent = asyncHandler(async (req: Request, res: Response) => {
  const coachId = req.decoded.userId as number;
  const eventData = req.body;

  if (req.decoded.permissionLevel === "read_only") {
    return res.status(403).json({
      message: "You do not have permission to create an event",
      response: null,
      error: "You do not have permission to create an event",
    });
  }

  const hasTeamAccess = await coachAuthQueries.checkTeamAccess(
    coachId,
    eventData.team_id,
  );
  if (!hasTeamAccess) {
    return res.status(403).json({
      message: "You do not have access to this team",
      response: null,
      error: "Forbidden",
    });
  }

  if (eventData.coach_ids && eventData.coach_ids.length > 0) {
    const allCoachesExist = await coachAuthQueries.checkCoachesExist(
      eventData.coach_ids,
    );
    if (!allCoachesExist) {
       return res.status(404).json({
        message: "One or more coaches not found",
        response: null,
        error: "One or more coaches not found",
      });
    }
  } else {
    // Default to the current coach if no coaches are specified
    eventData.coach_ids = [coachId];
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
  const coachId = req.decoded.userId as number;
  const teamId = req.query.teamId
    ? parseInt(req.query.teamId as string)
    : undefined;
  const targetDate = req.query.date
    ? new Date(req.query.date as string)
    : undefined;

  const result = await coachEventQueries.getCoachEvents(
    coachId,
    teamId,
    targetDate,
  );

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
    const coachId = req.decoded.userId;
    const { period, startDate, endDate } = req.query;

    const now = new Date();
    let start, end;

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

    const result = await eventQueries.getTimesheet(
      start,
      end,
      coachId as number,
    );

    let totalHourlyHours = 0;
    const hoursByType: Record<string, number> = {};

    result.forEach((item: any) => {
      totalHourlyHours += item.total_hours;
      const type = item.event_type || "Other";
      hoursByType[type] = (hoursByType[type] || 0) + item.total_hours;
    });

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
        },
      },
      error: null,
    });
  },
);

export const getEventById = asyncHandler(async (req: Request, res: Response) => {
  const coachId = req.decoded.userId as number;
  const { id } = req.params;
  const eventId = parseInt(id);

  const hasAccess = await coachEventQueries.checkEventAccess(coachId, eventId);
  if (!hasAccess) {
    return res.status(403).json({
      message: "You do not have access to this event",
      response: null,
      error: "Forbidden",
    });
  }

  const event = await eventQueries.getEventById(eventId);
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
});

export const updateEvent = asyncHandler(async (req: Request, res: Response) => {
  const coachId = req.decoded.userId as number;
  const { id } = req.params;
  const eventId = parseInt(id);
  const eventData = req.body;

  if (req.decoded.permissionLevel === "read_only") {
    return res.status(403).json({
      message: "You do not have permission to update this event",
      response: null,
      error: "You do not have permission to update this event",
    });
  }

  const hasAccess = await coachEventQueries.checkEventAccess(coachId, eventId);
  if (!hasAccess) {
    return res.status(403).json({
      message: "You do not have access to this event",
      response: null,
      error: "Forbidden",
    });
  }

  if (eventData.team_id) {
    const hasTeamAccess = await coachAuthQueries.checkTeamAccess(
      coachId,
      eventData.team_id,
    );
    if (!hasTeamAccess) {
      return res.status(403).json({
        message: "You do not have access to the target team",
        response: null,
        error: "Forbidden",
      });
    }
  }

  if (eventData.coach_ids && eventData.coach_ids.length > 0) {
    const allCoachesExist = await coachAuthQueries.checkCoachesExist(
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

  const result = await eventQueries.updateEvent(eventId, eventData);

  return res.status(200).json({
    message: "Event updated successfully",
    response: {
      data: result,
    },
    error: null,
  });
});

export const deleteEvent = asyncHandler(async (req: Request, res: Response) => {
  const coachId = req.decoded.userId as number;
  const { id } = req.params;
  const eventId = parseInt(id);

  if (req.decoded.permissionLevel === "read_only") {
    return res.status(403).json({
      message: "You do not have permission to delete this event",
      response: null,
      error: "You do not have permission to delete this event",
    });
  }

  const hasAccess = await coachEventQueries.checkEventAccess(coachId, eventId);
  if (!hasAccess) {
    return res.status(403).json({
      message: "You do not have access to this event",
      response: null,
      error: "Forbidden",
    });
  }

  await eventQueries.deleteEvent(eventId);

  return res.status(200).json({
    message: "Event deleted successfully",
    response: null,
    error: null,
  });
});
