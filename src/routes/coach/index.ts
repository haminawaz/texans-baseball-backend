import { Router } from "express";
import authRoutes from "./auth";
import playerRoutes from "./player";
import teamRoutes from "./team";

const router = Router();

router.use("/auth", authRoutes);
router.use("/players", playerRoutes);
router.use("/teams", teamRoutes);

export default router;
