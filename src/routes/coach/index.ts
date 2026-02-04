import { Router } from "express";
import authRoutes from "./auth";
import playerRoutes from "./player";
import teamRoutes from "./team";
import eventRoutes from "./event";

const router = Router();

router.use("/auth", authRoutes);
router.use("/players", playerRoutes);
router.use("/teams", teamRoutes);
router.use("/events", eventRoutes);

export default router;
