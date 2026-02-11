import { Router } from "express";
import authRoutes from "./auth";
import teamRoutes from "./team";
import uniformSizingRoutes from "./uniform-sizing";
import parentRoutes from "./parent";

const router = Router();

router.use("/auth", authRoutes);
router.use("/team", teamRoutes);
router.use("/uniform-sizing", uniformSizingRoutes);
router.use("/parents", parentRoutes);

export default router;
