import { Request, Response } from "express";
import { asyncHandler } from "../../middleware/errorHandler";
import playerTeamQueries from "../../queries/player/team";

export const getTeam = asyncHandler(async (req: Request, res: Response) => {
  const playerId = req.decoded.userId as number;
  const { period, startDate, endDate } = req.query;

  const player = await playerTeamQueries.getPlayerTeam(playerId);
  if (!player?.team) {
    return res.status(404).json({
      message: "You are not assigned to any team",
      response: null,
      error: "You are not assigned to any team",
    });
  }

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
  } else if (period === "custom" && startDate && endDate) {
    start = new Date(startDate as string);
    end = new Date(endDate as string);
    end.setHours(23, 59, 59, 999);
  } else if (period === "this_month") {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
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

  const teamId = player.team.id;
  const result = await playerTeamQueries.getPlayerTeamsheet(teamId, start, end);

  if (!result) {
    return res.status(404).json({
      message: "Team details not found",
      response: null,
      error: "Team details not found",
    });
  }

  let totalHours = 0;
  const hoursByType: Record<string, number> = {};

  result.teamsheet.forEach((item: any) => {
    totalHours += item.total_hours;
    const type = item.event_type || "Other";
    hoursByType[type] = (hoursByType[type] || 0) + item.total_hours;
  });

  const typeBreakdown = Object.entries(hoursByType)
    .map(([type, hours]) => `${type}: ${hours.toFixed(1)}h`)
    .join(" • ");

  return res.status(200).json({
    message: "Team details fetched successfully",
    response: {
      data: {
        team: result.team,
        coaches: result.coaches,
        teamsheet: result.teamsheet,
        total_hours: parseFloat(totalHours.toFixed(1)),
        breakdown: typeBreakdown,
      },
    },
    error: null,
  });
});
