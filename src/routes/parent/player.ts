import { Router } from "express";
import * as playerController from "../../controllers/parent/player.controller";
import { verifyParentToken } from "../../middleware/parentAuthMiddleware";
import { verifyParentPlayerLink } from "../../middleware/parentPlayerLink";
import { bodyValidator, paramsValidator } from "../../middleware/joi";
import { upload } from "../../middleware/upload";

const router = Router();
router.use(verifyParentToken);

router.get(
  "/:playerId/profile",
  paramsValidator("playerIdSchema"),
  verifyParentPlayerLink,
  playerController.getPlayerProfile,
);

router.put(
  "/:playerId/profile",
  paramsValidator("playerIdSchema"),
  verifyParentPlayerLink,
  upload.fields([
    { name: "profile_picture", maxCount: 1 },
    { name: "hero_image", maxCount: 1 },
  ]),
  bodyValidator("playerProfileUpdate"),
  playerController.updatePlayerProfile,
);

router.get(
  "/:playerId/uniform-sizing",
  paramsValidator("playerIdSchema"),
  verifyParentPlayerLink,
  playerController.getUniformSizing,
);

router.put(
  "/:playerId/uniform-sizing",
  paramsValidator("playerIdSchema"),
  verifyParentPlayerLink,
  bodyValidator("uniformSizingUpdate"),
  playerController.updateUniformSizing,
);

export default router;
