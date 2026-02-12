import { Router } from "express";
import authRoutes from "./auth";
import playerRoutes from "./player";
import teamRoutes from "./team";
import eventRoutes from "./event";
import tryoutRoutes from "./tryout";
import uniformSizingRoutes from "./uniform-sizing";
import messagingRoutes from "./messaging";

const router = Router();

router.use("/auth", authRoutes);
router.use("/players", playerRoutes);
router.use("/teams", teamRoutes);
router.use("/events", eventRoutes);
router.use("/tryouts", tryoutRoutes);
router.use("/uniform-sizing", uniformSizingRoutes);
router.use("/messages", messagingRoutes);

export default router;
