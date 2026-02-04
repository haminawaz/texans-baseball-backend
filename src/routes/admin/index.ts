import { Router } from "express";
import authRoutes from "./auth";
import coachRoutes from "./coach";
import teamRoutes from "./team";
import tryoutRoutes from "./tryout";
import eventRoutes from "./event";
import playerRoutes from "./player";

const router = Router();

router.use("/auth", authRoutes);
router.use("/coaches", coachRoutes);
router.use("/teams", teamRoutes);
router.use("/tryouts", tryoutRoutes);
router.use("/events", eventRoutes);
router.use("/players", playerRoutes);

export default router;
