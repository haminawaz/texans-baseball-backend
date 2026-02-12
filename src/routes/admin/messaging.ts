import { Router } from "express";
import * as messagingController from "../../controllers/messaging.controller";
import { verifyAdminToken } from "../../middleware/adminAuthMiddleware";

const router = Router();
router.use(verifyAdminToken);

router.get("/threads", messagingController.getThreads);

router.get("/threads/:threadId/messages", messagingController.getMessages);

export default router;
