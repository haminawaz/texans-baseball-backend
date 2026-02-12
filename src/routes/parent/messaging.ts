import { Router } from "express";
import * as messagingController from "../../controllers/messaging.controller";
import { verifyParentToken } from "../../middleware/parentAuthMiddleware";

const router = Router();
router.use(verifyParentToken);

router.get("/threads", messagingController.getThreads);

router.get("/threads/:threadId/messages", messagingController.getMessages);

export default router;
