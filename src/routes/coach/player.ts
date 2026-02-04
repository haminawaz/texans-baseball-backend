import { Router } from "express";
import * as playerController from "../../controllers/coach/player.controller";
import {
  queryValidator,
  paramsValidator,
  bodyValidator,
} from "../../middleware/joi";
import { verifyUserToken } from "../../middleware/coachAuthMiddleware";

const router = Router();
router.use(verifyUserToken);

router.get(
  "/",
  queryValidator("getPlayerListSchema"),
  playerController.getPlayers,
);

router.get("/:id", paramsValidator("idSchema"), playerController.getPlayerById);

router.patch(
  "/:id",
  paramsValidator("idSchema"),
  bodyValidator("playerProfileUpdate"),
  playerController.updatePlayer,
);

export default router;
