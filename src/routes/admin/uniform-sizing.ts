import { Router } from "express";
import * as uniformSizingController from "../../controllers/admin/uniform-sizing.controller";
import {
  paramsValidator,
  bodyValidator,
  queryValidator,
} from "../../middleware/joi";
import { verifyAdminToken } from "../../middleware/adminAuthMiddleware";

const router = Router();
router.use(verifyAdminToken);

router.get(
  "/coaches",
  queryValidator("getPlayerListSchema"),
  uniformSizingController.getAllCoachesUniformSizing,
);

router.put(
  "/coaches/:id",
  paramsValidator("idSchema"),
  bodyValidator("coachUniformSizingUpdate"),
  uniformSizingController.updateCoachUniformSizing,
);

router.get(
  "/players",
  queryValidator("getPlayerListSchema"),
  uniformSizingController.getAllPlayersUniformSizing,
);

router.put(
  "/players/:id",
  paramsValidator("idSchema"),
  bodyValidator("uniformSizingUpdate"),
  uniformSizingController.updatePlayerUniformSizing,
);

export default router;
