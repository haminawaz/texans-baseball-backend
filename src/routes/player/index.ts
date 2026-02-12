import { Router } from "express";
import authRoutes from "./auth";
import teamRoutes from "./team";
import uniformSizingRoutes from "./uniform-sizing";
import parentRoutes from "./parent";
import messagingRoutes from "./messaging";

const router = Router();

router.use("/auth", authRoutes);
router.use("/team", teamRoutes);
router.use("/uniform-sizing", uniformSizingRoutes);
router.use("/parents", parentRoutes);
router.use("/messages", messagingRoutes);

export default router;
