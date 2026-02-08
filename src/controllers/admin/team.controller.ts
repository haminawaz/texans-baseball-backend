import { Request, Response } from "express";
import { asyncHandler } from "../../middleware/errorHandler";
import teamQueries from "../../queries/admin/team";
import coachQueries from "../../queries/coach/auth";

export const createTeam = asyncHandler(async (req: Request, res: Response) => {
  const { team_name, age_group, coach_ids } = req.body;
  if (coach_ids && coach_ids.length > 0) {
    const allExist = await coachQueries.checkCoachesExist(coach_ids);
    if (!allExist) {
      return res.status(400).json({
        message: "One or more coach IDs are invalid",
        response: null,
        error: "Invalid coach IDs",
      });
    }
  }

  const result = await teamQueries.createTeam(team_name, age_group, coach_ids);
  const formattedTeam = {
    ...result,
    coaches: result.coaches.map((c: any) => c.coach),
  };

  return res.status(201).json({
    message: "Team created successfully",
    response: {
        data: formattedTeam,
      },
    error: null,
  });
});

export const getTeams = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.pageSize as string) || 10;

  const result = await teamQueries.getTeams(page, limit);
  const formattedTeams = result.teams.map((team) => ({
    ...team,
    coaches: team.coaches.map((c: any) => c.coach),
  }));

  const data = {
    data: formattedTeams,
    pagination: {
      page,
      limit,
      total: result.total,
    },
  };

  return res.status(200).json({
    message: "Teams fetched successfully",
    response: data,
    error: null,
  });
});

export const getTeamById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await teamQueries.getTeamDetails(parseInt(id));
  if (!result) {
    return res.status(404).json({
      message: "Team not found",
      response: null,
      error: "Team not found",
    });
  }

  const formattedTeam = {
    ...result,
    coaches: result.coaches.map((c: any) => c.coach),
  };

  return res.status(200).json({
    message: "Team fetched successfully",
    response: {
      data: formattedTeam,
    },
    error: null,
  });
});

export const updateTeam = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { team_name, age_group, coach_ids } = req.body;

  const existingTeam = await teamQueries.getTeamById(parseInt(id));
  if (!existingTeam) {
    return res.status(404).json({
      message: "Team not found",
      response: null,
      error: "Team not found",
    });
  }

  if (coach_ids && coach_ids.length > 0) {
    const allExist = await coachQueries.checkCoachesExist(coach_ids);
    if (!allExist) {
      return res.status(400).json({
        message: "One or more coach IDs are invalid",
        response: null,
        error: "Invalid coach IDs",
      });
    }
  }

  await teamQueries.updateTeam(parseInt(id), team_name, age_group, coach_ids);

  return res.status(200).json({
    message: "Team updated successfully",
    response: null,
    error: null,
  });
});

export const updateTeamPicture = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { team_pictures_url } = req.body;

    const existingTeam = await teamQueries.getTeamById(parseInt(id));
    if (!existingTeam) {
      return res.status(404).json({
        message: "Team not found",
        response: null,
        error: "Team not found",
      });
    }

    await teamQueries.updateTeamPicture(parseInt(id), team_pictures_url);

    return res.status(200).json({
      message: "Team picture updated successfully",
      response: null,
      error: null,
    });
  },
);

export const deleteTeam = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const existingTeam = await teamQueries.getTeamById(parseInt(id));
  if (!existingTeam) {
    return res.status(404).json({
      message: "Team not found",
      response: null,
      error: "Team not found",
    });
  }

  await teamQueries.deleteTeam(parseInt(id));

  return res.status(200).json({
    message: "Team deleted successfully",
    response: null,
    error: null,
  });
});
