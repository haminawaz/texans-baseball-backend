import { Router } from "express";
import * as messagingController from "../../controllers/messaging.controller";
import { bodyValidator } from "../../middleware/joi";
import { verifyUserToken } from "../../middleware/authMiddleware";

const router = Router();
router.use(verifyUserToken);

router.get("/threads", messagingController.getThreads);

router.get("/threads/:threadId/messages", messagingController.getMessages);

router.post(
  "/threads",
  bodyValidator("createThread"),
  messagingController.createThread,
);

router.post(
  "/send",
  bodyValidator("sendMessage"),
  messagingController.sendMessage,
);

router.post(
  "/reactions",
  bodyValidator("addReaction"),
  messagingController.addReaction,
);

export default router;
