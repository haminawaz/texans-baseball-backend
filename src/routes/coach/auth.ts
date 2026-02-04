import { Router } from "express";
import * as authController from "../../controllers/coach/auth.controller";
import { bodyValidator, queryValidator } from "../../middleware/joi";
import { verifyUserToken } from "../../middleware/coachAuthMiddleware";
const router = Router();

router.post("/login", bodyValidator("login"), authController.login);

router.put(
  "/profile",
  verifyUserToken,
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

router.get(
  "/timesheet",
  verifyUserToken,
  queryValidator("getCoachTimesheet"),
  authController.getTimesheet
);

export default router;
