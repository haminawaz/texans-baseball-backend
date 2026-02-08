import { Request, Response } from "express";
import { asyncHandler } from "../../middleware/errorHandler";
import teamQueries from "../../queries/admin/team";
import adminCoachQueries from "../../queries/admin/coach";
import coachQueries from "../../queries/coach/auth";

export const createTeam = asyncHandler(async (req: Request, res: Response) => {
  const coachId = req.decoded.userId as number;
  const { team_name, age_group, coach_ids } = req.body;

  if (req.decoded.permissionLevel === "read_only") {
    return res.status(403).json({
      message: "You do not have permission to create a team",
      response: null,
      error: "You do not have permission to create a team",
    });
  }

  const finalCoachIds = coach_ids
    ? [...new Set([...coach_ids, coachId])]
    : [coachId];
  if (coach_ids && coach_ids.length > 0) {
    const allExist = await coachQueries.checkCoachesExist(coach_ids);
    if (!allExist) {
      return res.status(400).json({
        message: "One or more coach IDs are invalid",
        response: null,
        error: "One or more coach IDs are invalid",
      });
    }
  }

  const result = await teamQueries.createTeam(
    team_name,
    age_group,
    finalCoachIds,
  );
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
  const coachId = req.decoded.userId as number;

  const result = await adminCoachQueries.getCoachTeams(coachId);
  const formattedTeams = result?.teams?.map((team: any) => team.team) || [];

  return res.status(200).json({
    message: "Coach teams fetched successfully",
    response: {
      data: formattedTeams,
    },
    error: null,
  });
});

export const getTeamById = asyncHandler(async (req: Request, res: Response) => {
  const coachId = req.decoded.userId as number;
  const { id } = req.params;
  const teamId = parseInt(id);

  const hasAccess = await coachQueries.checkTeamAccess(coachId, teamId);
  if (!hasAccess) {
    return res.status(403).json({
      message: "You do not have access to this team",
      response: null,
      error: "You do not have access to this team",
    });
  }

  const result = await teamQueries.getTeamDetails(teamId);
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
    message: "Team details fetched successfully",
    response: {
      data: formattedTeam,
    },
    error: null,
  });
});

export const updateTeam = asyncHandler(async (req: Request, res: Response) => {
  const coachId = req.decoded.userId as number;
  const { id } = req.params;
  const teamId = parseInt(id);
  const { team_name, age_group } = req.body;

  if (req.decoded.permissionLevel === "read_only") {
    return res.status(403).json({
      message: "You do not have permission to update the team",
      response: null,
      error: "You do not have permission to update the team",
    });
  }

  const hasAccess = await coachQueries.checkTeamAccess(coachId, teamId);
  if (!hasAccess) {
    return res.status(403).json({
      message: "You do not have access to this team",
      response: null,
      error: "You do not have access to this team",
    });
  }

  const currentTeam = await teamQueries.getTeamDetails(teamId);
  const currentCoachIds =
    currentTeam?.coaches.map((c: any) => c.coach.id) || [];

  await teamQueries.updateTeam(teamId, team_name, age_group, currentCoachIds);

  return res.status(200).json({
    message: "Team updated successfully",
    response: null,
    error: null,
  });
});

export const updateTeamPicture = asyncHandler(
  async (req: Request, res: Response) => {
    const coachId = req.decoded.userId as number;
    const { id } = req.params;
    const teamId = parseInt(id);
    const { team_pictures_url } = req.body;

    if (req.decoded.permissionLevel === "read_only") {
      return res.status(403).json({
        message: "You do not have permission to update the team",
        response: null,
        error: "You do not have permission to update the team",
      });
    }

    const hasAccess = await coachQueries.checkTeamAccess(coachId, teamId);
    if (!hasAccess) {
      return res.status(403).json({
        message: "You do not have access to this team",
        response: null,
        error: "You do not have access to this team",
      });
    }

    await teamQueries.updateTeamPicture(teamId, team_pictures_url);

    return res.status(200).json({
      message: "Team picture updated successfully",
      response: null,
      error: null,
    });
  },
);

export const deleteTeam = asyncHandler(async (req: Request, res: Response) => {
  const coachId = req.decoded.userId as number;
  const { id } = req.params;
  const teamId = parseInt(id);

  if (req.decoded.permissionLevel === "read_only") {
    return res.status(403).json({
      message: "You do not have permission to delete the team",
      response: null,
      error: "You do not have permission to delete the team",
    });
  }

  const hasAccess = await coachQueries.checkTeamAccess(coachId, teamId);
  if (!hasAccess) {
    return res.status(403).json({
      message: "You do not have access to this team",
      response: null,
      error: "You do not have access to this team",
    });
  }

  await teamQueries.deleteTeam(teamId);

  return res.status(200).json({
    message: "Team deleted successfully",
    response: null,
    error: null,
  });
});
