import { Router } from "express";
import * as messagingController from "../../controllers/messaging.controller";
import {
  bodyValidator,
  paramsValidator,
  queryValidator,
} from "../../middleware/joi";
import { verifyUserToken } from "../../middleware/coachAuthMiddleware";

const router = Router();
router.use(verifyUserToken);

router.get("/threads", messagingController.getThreads);

router.get(
  "/threads/:threadId/messages",
  queryValidator("paginationSchema"),
  paramsValidator("threadIdSchema"),
  messagingController.getMessages,
);

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

router.delete(
  "/reactions/:reactionId",
  paramsValidator("reactionIdSchema"),
  messagingController.removeReaction,
);

router.delete(
  "/:messageId",
  paramsValidator("messageIdSchema"),
  messagingController.deleteMessage,
);

router.delete(
  "/threads/:threadId",
  paramsValidator("threadIdSchema"),
  messagingController.deleteThread,
);

export default router;
