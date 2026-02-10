import { Router } from "express";
import * as uniformSizingController from "../../controllers/player/uniform-sizing.controller";
import { bodyValidator } from "../../middleware/joi";
import { verifyUserToken } from "../../middleware/authMiddleware";
const router = Router();

router.get("/", verifyUserToken, uniformSizingController.getUniformSizing);

router.put(
  "/",
  verifyUserToken,
  bodyValidator("uniformSizingUpdate"),
  uniformSizingController.updateUniformSizing,
);

export default router;
