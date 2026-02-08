import { Router } from "express";
import * as playerController from "../../controllers/coach/player.controller";
import {
  queryValidator,
  paramsValidator,
  bodyValidator,
} from "../../middleware/joi";
import { verifyUserToken } from "../../middleware/coachAuthMiddleware";
import { upload } from "../../middleware/upload";

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
  upload.fields([
    { name: "profile_picture", maxCount: 1 },
    { name: "hero_image", maxCount: 1 },
  ]),
  paramsValidator("idSchema"),
  bodyValidator("playerProfileUpdate"),
  playerController.updatePlayer,
);

export default router;
