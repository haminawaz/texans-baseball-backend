import { Request, Response } from "express";
import { asyncHandler } from "../../middleware/errorHandler";
import tryoutQueries from "../../queries/admin/tryout";
import teamQueries from "../../queries/admin/team";

export const createTryout = asyncHandler(
  async (req: Request, res: Response) => {
    const tryoutData = req.body;

    const existingTeam = await teamQueries.getTeamById(tryoutData.team_id);
    if (!existingTeam) {
      return res.status(404).json({
        message: "Team not found",
        response: null,
        error: "Team not found",
      });
    }

    const result = await tryoutQueries.createTryout(tryoutData);

    return res.status(201).json({
      message: "Tryout created successfully",
      response: {
        data: result,
      },
      error: null,
    });
  },
);

export const getTryouts = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.pageSize as string) || 10;

  const result = await tryoutQueries.getTryouts(page, limit);

  return res.status(200).json({
    message: "Tryouts fetched successfully",
    response: {
      data: result,
    },
    error: null,
  });
});

export const getTryoutById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const tryout = await tryoutQueries.getTryoutById(parseInt(id));
    if (!tryout) {
      return res.status(404).json({
        message: "Tryout not found",
        response: null,
        error: "Tryout not found",
      });
    }

    return res.status(200).json({
      message: "Tryout fetched successfully",
      response: {
        data: tryout,
      },
      error: null,
    });
  },
);

export const updateTryout = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;

    const existing = await tryoutQueries.getTryoutById(parseInt(id));
    if (!existing) {
      return res.status(404).json({
        message: "Tryout not found",
        response: null,
        error: "Tryout not found",
      });
    }

    if (updateData.team_id) {
      const existingTeam = await teamQueries.getTeamById(updateData.team_id);
      if (!existingTeam) {
        return res.status(404).json({
          message: "Team not found",
          response: null,
          error: "Team not found",
        });
      }
    }

    const result = await tryoutQueries.updateTryout(parseInt(id), updateData);

    return res.status(200).json({
      message: "Tryout updated successfully",
      response: {
        data: result,
      },
      error: null,
    });
  },
);

export const deleteTryout = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const existing = await tryoutQueries.getTryoutById(parseInt(id));
    if (!existing) {
      return res.status(404).json({
        message: "Tryout not found",
        response: null,
        error: "Tryout not found",
      });
    }

    await tryoutQueries.deleteTryout(parseInt(id));

    return res.status(200).json({
      message: "Tryout deleted successfully",
      response: null,
      error: null,
    });
  },
);
