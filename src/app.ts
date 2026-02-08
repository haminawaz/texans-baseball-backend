import express, { Application } from "express";
import compression from "compression";
import { JwtPayload } from "jsonwebtoken";
import securityMiddleware from "./middleware/security";
import requestLogger from "./middleware/requestLogger";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

import healthRoutes from "./routes/health.routes";
import apiRoutes from "./routes/api.routes";

declare global {
  namespace Express {
    interface Request {
      id?: string;
      decoded: {
        userId?: number;
        email?: string;
        companyId?: number;
        permissionLevel?: string;
      } & JwtPayload;
    }
  }
}

const app: Application = express();
app.set("trust proxy", 1);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(compression());
app.use(securityMiddleware);
app.use(requestLogger);

app.use("/health", healthRoutes);
app.use("/api/v1", apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
