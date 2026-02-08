import { Router } from "express";
import * as teamController from "../../controllers/admin/team.controller";
import {
  bodyValidator,
  paramsValidator,
  queryValidator,
} from "../../middleware/joi";
import { verifyAdminToken } from "../../middleware/adminAuthMiddleware";

const router = Router();
router.use(verifyAdminToken);

router.post(
  "/",
  bodyValidator("createTeam"),
  teamController.createTeam,
);

router.get(
  "/",
  queryValidator("paginationSchema"),
  teamController.getTeams,
);

router.get(
  "/:id",
  paramsValidator("idSchema"),
  teamController.getTeamById,
);

router.patch(
  "/:id",
  paramsValidator("idSchema"),
  bodyValidator("updateTeam"),
  teamController.updateTeam,
);

router.patch(
  "/:id/picture",
  paramsValidator("idSchema"),
  bodyValidator("updateTeamPicture"),
  teamController.updateTeamPicture,
);

router.delete(
  "/:id",
  paramsValidator("idSchema"),
  teamController.deleteTeam,
);

export default router;
