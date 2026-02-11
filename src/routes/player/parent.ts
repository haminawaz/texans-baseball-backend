import { Router } from "express";
import * as parentController from "../../controllers/player/parent.controller";
import { bodyValidator } from "../../middleware/joi";
import { verifyUserToken } from "../../middleware/authMiddleware";

const router = Router();
router.use(verifyUserToken);

router.post(
  "/add",
  bodyValidator("addParentSchema"),
  parentController.addParent,
);

router.get("/", parentController.getParents);

router.delete("/:parentId", parentController.removeParent);

export default router;
