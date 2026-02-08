import { Router } from "express";
import * as authController from "../../controllers/player/auth.controller";
import { bodyValidator, queryValidator } from "../../middleware/joi";
import { verifyUserToken } from "../../middleware/authMiddleware";
import { upload } from "../../middleware/upload";
const router = Router();

router.post("/signup", bodyValidator("signup"), authController.signup);

router.post(
  "/verify",
  queryValidator("authToken"),
  authController.verifyPlayerEmail
);

router.post("/login", bodyValidator("login"), authController.login);

router.get("/profile", verifyUserToken, authController.getProfile);

router.put(
  "/profile",
  verifyUserToken,
  upload.fields([
    { name: "profile_picture", maxCount: 1 },
    { name: "hero_image", maxCount: 1 },
  ]),
  bodyValidator("playerProfileUpdate"),
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
  queryValidator("authToken"),
  bodyValidator("resetPassword"),
  authController.resetPassword
);

export default router;
