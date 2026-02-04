import { Router } from "express";
import authRoutes from "./auth";
import playerRoutes from "./player";

const router = Router();

router.use("/auth", authRoutes);
router.use("/players", playerRoutes);

export default router;
