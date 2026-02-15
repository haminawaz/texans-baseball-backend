import { Router } from "express";
import * as messagingController from "../../controllers/admin/messaging.controller";
import { paramsValidator, queryValidator } from "../../middleware/joi";
import { verifyAdminToken } from "../../middleware/adminAuthMiddleware";

const router = Router();
router.use(verifyAdminToken);

router.get(
  "/threads",
  queryValidator("paginationSchema"),
  messagingController.getThreads,
);

router.get(
  "/threads/:threadId/messages",
  queryValidator("paginationSchema"),
  paramsValidator("threadIdSchema"),
  messagingController.getMessages,
);

router.delete(
  "/threads/:threadId",
  paramsValidator("threadIdSchema"),
  messagingController.deleteThread,
);

export default router;
