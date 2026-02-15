import { Router } from "express";
import * as messagingController from "../../controllers/parent/messaging.controller";
import { verifyParentToken } from "../../middleware/parentAuthMiddleware";
import { verifyParentPlayerLink } from "../../middleware/parentPlayerLink";
import { paramsValidator, queryValidator } from "../../middleware/joi";

const router = Router();
router.use(verifyParentToken);

router.get(
  "/:playerId/threads",
  paramsValidator("playerIdSchema"),
  verifyParentPlayerLink,
  messagingController.getThreads,
);

router.get(
  "/:playerId/threads/:threadId/messages",
  verifyParentPlayerLink,
  paramsValidator("getParentPlayerMessageSchema"),
  queryValidator("paginationSchema"),
  messagingController.getMessages,
);

export default router;
