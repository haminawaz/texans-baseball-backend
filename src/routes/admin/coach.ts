import { Router } from "express";
import * as coachController from "../../controllers/admin/coach.controller";
import {
  bodyValidator,
  paramsValidator,
  queryValidator,
} from "../../middleware/joi";
import { verifyAdminToken } from "../../middleware/adminAuthMiddleware";

const router = Router();
router.use(verifyAdminToken);

router.post(
  "/invite",
  bodyValidator("inviteCoach"),
  coachController.inviteCoach,
);

router.get("/", queryValidator("getCoaches"), coachController.getCoaches);

router.get("/:id", paramsValidator("idSchema"), coachController.getCoachById);

router.get(
  "/:id/teams",
  paramsValidator("idSchema"),
  coachController.getCoachTeams,
);

router.patch(
  "/:id",
  paramsValidator("idSchema"),
  bodyValidator("updateCoach"),
  coachController.updateCoach,
);

router.delete("/:id", paramsValidator("idSchema"), coachController.deleteCoach);

export default router;
