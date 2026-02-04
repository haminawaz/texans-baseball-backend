import express, { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler";

const router: Router = express.Router();

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    return res.status(200).json({
      message: "Server is running",
      response: {
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
      error: null,
    });
  })
);

export default router;
