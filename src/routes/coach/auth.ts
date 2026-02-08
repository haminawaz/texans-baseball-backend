import { Router } from "express";
import * as authController from "../../controllers/coach/auth.controller";
import { bodyValidator, queryValidator } from "../../middleware/joi";
import { verifyUserToken } from "../../middleware/coachAuthMiddleware";
import { upload } from "../../middleware/upload";
const router = Router();

router.post("/login", bodyValidator("login"), authController.login);

router.put(
  "/profile",
  verifyUserToken,
  upload.fields([
    { name: "profile_picture", maxCount: 1 },
  ]),
  bodyValidator("coachProfileUpdate"),
  authController.updateProfile
);

router.put(
  "/password",
  verifyUserToken,
  bodyValidator("passwordUpdate"),
  authController.updatePassword
);

router.post(
  "/forgot-password",
  bodyValidator("forgotPassword"),
  authController.forgotPassword
);

router.post(
  "/reset-password",
  queryValidator("coachPasswordUpdate"),
  bodyValidator("resetPassword"),
  authController.resetPassword
);

export default router;
