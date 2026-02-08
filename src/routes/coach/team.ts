import { Router } from "express";
import * as teamController from "../../controllers/coach/team.controller";
import { bodyValidator, paramsValidator } from "../../middleware/joi";
import { verifyUserToken } from "../../middleware/coachAuthMiddleware";

const router = Router();
router.use(verifyUserToken);

router.post("/", bodyValidator("createTeam"), teamController.createTeam);

router.get("/", teamController.getTeams);

router.get("/:id", paramsValidator("idSchema"), teamController.getTeamById);

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

router.delete("/:id", paramsValidator("idSchema"), teamController.deleteTeam);

export default router;
