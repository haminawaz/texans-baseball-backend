import { Router } from "express";
import * as coachController from "../../controllers/admin/coach.controller";
import {
  bodyValidator,
  paramsValidator,
  queryValidator,
} from "../../middleware/joi";
import { verifyAdminToken } from "../../middleware/adminAuthMiddleware";
import { upload } from "../../middleware/upload";

const router = Router();
router.use(verifyAdminToken);

router.post(
  "/invite",
  bodyValidator("inviteCoach"),
  upload.fields([
    { name: "profile_picture", maxCount: 1 },
  ]),
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
  upload.fields([
    { name: "profile_picture", maxCount: 1 },
  ]),
  coachController.updateCoach,
);

router.patch(
  "/:id/team-access",
  paramsValidator("idSchema"),
  bodyValidator("updateCoachTeamAccess"),
  coachController.updateCoachTeamAccess,
);

router.delete("/:id", paramsValidator("idSchema"), coachController.deleteCoach);

export default router;
