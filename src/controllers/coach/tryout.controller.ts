import { Request, Response } from "express";
import { asyncHandler } from "../../middleware/errorHandler";
import tryoutQueries from "../../queries/admin/tryout";
import coachTryoutQueries from "../../queries/coach/tryout";
import coachAuthQueries from "../../queries/coach/auth";

export const createTryout = asyncHandler(
  async (req: Request, res: Response) => {
    const coachId = req.decoded.userId as number;
    const tryoutData = req.body;

    if (req.decoded.permissionLevel === "read_only") {
      return res.status(403).json({
        message: "You do not have permission to create a tryout",
        response: null,
        error: "You do not have permission to create a tryout",
      });
    }

    const hasTeamAccess = await coachAuthQueries.checkTeamAccess(
      coachId,
      tryoutData.team_id,
    );
    if (!hasTeamAccess) {
      return res.status(403).json({
        message: "You do not have access to this team",
        response: null,
        error: "You do not have access to this team",
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
  const coachId = req.decoded.userId as number;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.pageSize as string) || 10;

  const result = await coachTryoutQueries.getCoachTryouts(coachId, page, limit);

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
    const coachId = req.decoded.userId as number;
    const { id } = req.params;
    const tryoutId = parseInt(id);

    const hasAccess = await coachTryoutQueries.checkTryoutAccess(
      coachId,
      tryoutId,
    );
    if (!hasAccess) {
      return res.status(403).json({
        message: "You do not have access to this tryout",
        response: null,
        error: "You do not have access to this tryout",
      });
    }

    const tryout = await tryoutQueries.getTryoutById(tryoutId);
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
    const coachId = req.decoded.userId as number;
    const { id } = req.params;
    const tryoutId = parseInt(id);
    const updateData = req.body;

    if (req.decoded.permissionLevel === "read_only") {
      return res.status(403).json({
        message: "You do not have permission to update this tryout",
        response: null,
        error: "You do not have permission to update this tryout",
      });
    }

    const hasAccess = await coachTryoutQueries.checkTryoutAccess(
      coachId,
      tryoutId,
    );
    if (!hasAccess) {
      return res.status(403).json({
        message: "You do not have access to this tryout",
        response: null,
        error: "You do not have access to this tryout",
      });
    }

    if (updateData.team_id) {
      const hasTeamAccess = await coachAuthQueries.checkTeamAccess(
        coachId,
        updateData.team_id,
      );
      if (!hasTeamAccess) {
        return res.status(403).json({
          message: "You do not have access to this team",
          response: null,
          error: "You do not have access to this team",
        });
      }
    }

    const result = await tryoutQueries.updateTryout(tryoutId, updateData);

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
    const coachId = req.decoded.userId as number;
    const { id } = req.params;
    const tryoutId = parseInt(id);

    if (req.decoded.permissionLevel === "read_only") {
      return res.status(403).json({
        message: "You do not have permission to delete this tryout",
        response: null,
        error: "You do not have permission to delete this tryout",
      });
    }

    const hasAccess = await coachTryoutQueries.checkTryoutAccess(
      coachId,
      tryoutId,
    );
    if (!hasAccess) {
      return res.status(403).json({
        message: "You do not have access to this tryout",
        response: null,
        error: "You do not have access to this tryout",
      });
    }

    await tryoutQueries.deleteTryout(tryoutId);

    return res.status(200).json({
      message: "Tryout deleted successfully",
      response: null,
      error: null,
    });
  },
);
