import { Router } from "express";
import * as authController from "../../controllers/admin/auth.controller";
import { bodyValidator } from "../../middleware/joi";
const router = Router();

router.post("/login", bodyValidator("login"), authController.login);

export default router;
