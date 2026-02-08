import { Router } from "express";
import * as playerController from "../../controllers/admin/player.controller";
import {
  queryValidator,
  paramsValidator,
  bodyValidator,
} from "../../middleware/joi";
import { verifyAdminToken } from "../../middleware/adminAuthMiddleware";
import { upload } from "../../middleware/upload";

const router = Router();
router.use(verifyAdminToken);

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

router.put(
  "/:id/assign-team",
  paramsValidator("idSchema"),
  bodyValidator("assignPlayerTeam"),
  playerController.assignTeam,
);

router.delete(
  "/:id",
  paramsValidator("idSchema"),
  playerController.deletePlayer,
);

export default router;
