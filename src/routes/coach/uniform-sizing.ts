import { Router } from "express";
import * as uniformSizingController from "../../controllers/coach/uniform-sizing.controller";
import {
  paramsValidator,
  bodyValidator,
  queryValidator,
} from "../../middleware/joi";
import { verifyUserToken } from "../../middleware/coachAuthMiddleware";

const router = Router();
router.use(verifyUserToken);

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
