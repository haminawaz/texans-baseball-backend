import { Router } from "express";
import * as playerController from "../../controllers/admin/player.controller";
import { queryValidator, paramsValidator } from "../../middleware/joi";
import { verifyAdminToken } from "../../middleware/adminAuthMiddleware";

const router = Router();
// router.use(verifyAdminToken);

router.get(
  "/",
  queryValidator("getPlayerListSchema"),
  playerController.getPlayers,
);

router.get("/:id", paramsValidator("idSchema"), playerController.getPlayerById);

router.delete(
  "/:id",
  paramsValidator("idSchema"),
  playerController.deletePlayer,
);

export default router;
