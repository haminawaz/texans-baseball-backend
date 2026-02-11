import { Router } from "express";
import authRoutes from "./auth";
import playerRoutes from "./player";
import teamRoutes from "./team";

const router = Router();

router.use("/auth", authRoutes);
router.use("/player", playerRoutes);
router.use("/team", teamRoutes);

export default router;
