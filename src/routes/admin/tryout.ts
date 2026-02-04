import { Router } from "express";
import * as tryoutController from "../../controllers/admin/tryout.controller";
import {
  bodyValidator,
  paramsValidator,
  queryValidator,
} from "../../middleware/joi";
import { verifyAdminToken } from "../../middleware/adminAuthMiddleware";

const router = Router();
router.use(verifyAdminToken);

router.post("/", bodyValidator("createTryout"), tryoutController.createTryout);

router.get(
  "/",
  queryValidator("paginationSchema"),
  tryoutController.getTryouts,
);

router.get("/:id", paramsValidator("idSchema"), tryoutController.getTryoutById);

router.patch(
  "/:id",
  paramsValidator("idSchema"),
  bodyValidator("updateTryout"),
  tryoutController.updateTryout,
);

router.delete(
  "/:id",
  paramsValidator("idSchema"),
  tryoutController.deleteTryout,
);

export default router;
