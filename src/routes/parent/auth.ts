import { Router } from "express";
import * as authController from "../../controllers/parent/auth.controller";
import { bodyValidator, queryValidator } from "../../middleware/joi";
import { verifyParentToken } from "../../middleware/parentAuthMiddleware";

const router = Router();

router.get(
  "/players/all",
  queryValidator("playersByTeamCode"),
  authController.getPlayersByTeamCode,
);

router.get(
  "/invitation/accept",
  queryValidator("invitationAccept"),
  authController.acceptInvitation,
);

router.post("/signup", bodyValidator("parentSignup"), authController.signup);

router.post(
  "/verify",
  queryValidator("authToken"),
  authController.verifyPlayerEmail
);

router.post("/login", bodyValidator("login"), authController.login);

router.post(
  "/forgot-password",
  bodyValidator("forgotPassword"),
  authController.forgotPassword,
);

router.post(
  "/reset-password",
  queryValidator("parentResetPasswordQuery"),
  bodyValidator("resetPassword"),
  authController.resetPassword,
);

router.get("/players", verifyParentToken, authController.getPlayers);

export default router;
