import express, { Request, Response, Router } from "express";
import adminRoutes from "./admin/index";
import playerRoutes from "./player/index";

const router: Router = express.Router();

router.get("/", (_req: Request, res: Response) => {
  return res.status(200).json({
    message: "API is working",
    response: {
      version: "1.0.0",
    },
    error: null,
  });
});

router.use("/admin", adminRoutes);
router.use("/player", playerRoutes);

export default router;
