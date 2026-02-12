import { Router } from "express";
import authRoutes from "./auth";
import playerRoutes from "./player";
import teamRoutes from "./team";
import messagingRoutes from "./messaging";

const router = Router();

router.use("/auth", authRoutes);
router.use("/player", playerRoutes);
router.use("/team", teamRoutes);
router.use("/messages", messagingRoutes);

export default router;
