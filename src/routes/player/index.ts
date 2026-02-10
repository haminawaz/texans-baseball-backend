import { Router } from "express";
import authRoutes from "./auth";
import teamRoutes from "./team";
import uniformSizingRoutes from "./uniform-sizing";

const router = Router();

router.use("/auth", authRoutes);
router.use("/team", teamRoutes);
router.use("/uniform-sizing", uniformSizingRoutes);

export default router;
