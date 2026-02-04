import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config/env";
import adminQueries from "../queries/admin/auth";

const verifyAdminJwt =
  () => async (req: Request, res: Response, next: NextFunction) => {
    try {
      let token = req.headers.authorization;
      if (token) {
        if (token.startsWith("Bearer ")) {
          token = token.slice(7, token.length);
        }

        let decoded = jwt.verify(token, config.jwtSecret!) as JwtPayload;
        if (!decoded.exp || Date.now() >= decoded.exp * 1000) {
          return res.status(401).json({
            error: "Access denied. Token has expired",
            response: null,
            message: "Access denied. Token has expired",
          });
        }

        const email = decoded.email;
        const adminData = await adminQueries.getAdminForJwt(email);
        if (!adminData) {
          return res.status(404).json({
            error: "Access denied. Admin not found",
            response: null,
            message: "Access denied. Admin not found",
          });
        }

        req.decoded = {
          ...decoded,
          adminId: adminData.id,
        };
      } else {
        return res.status(401).json({
          error: "Access denied. Authorization token is missing",
          response: null,
          message: "Access denied. Authorization token is missing",
        });
      }
      return next();
    } catch (error: any) {
      return res.status(401).json({
        error: error.message || error,
        response: null,
        message: "Authorization failed",
      });
    }
  };

export const verifyAdminToken = verifyAdminJwt();
