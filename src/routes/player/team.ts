import { Router } from "express";
import * as teamController from "../../controllers/player/team.controller";
import { verifyUserToken } from "../../middleware/authMiddleware";

const router = Router();
router.use(verifyUserToken);

router.get("/", teamController.getTeam);

export default router;
