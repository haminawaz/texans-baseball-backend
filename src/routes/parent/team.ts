import { Router } from "express";
import * as teamController from "../../controllers/parent/team.controller";
import { verifyParentToken } from "../../middleware/parentAuthMiddleware";
import { verifyParentPlayerLink } from "../../middleware/parentPlayerLink";
import { paramsValidator, queryValidator } from "../../middleware/joi";

const router = Router();
router.use(verifyParentToken);

router.get(
  "/:playerId/dashboard",
  paramsValidator("playerIdSchema"),
  verifyParentPlayerLink,
  queryValidator("getCoachTimesheet"),
  teamController.getTeamDashboard,
);

router.get(
  "/:playerId/teammates",
  paramsValidator("playerIdSchema"),
  verifyParentPlayerLink,
  teamController.getPlayersOfTeam,
);

export default router;
