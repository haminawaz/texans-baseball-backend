import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config/env";
import parentQueries from "../queries/parent/auth";

const verifyParentJwt =
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
        const parentData = await parentQueries.getParentForJwt(email);
        if (!parentData) {
          return res.status(404).json({
            error: "Access denied. Parent not found",
            response: null,
            message: "Access denied. Parent not found",
          });
        }
        if (!parentData.email_verified) {
          return res.status(403).json({
            error: "Account not verified. Please verify your email",
            response: null,
            message: "Account not verified. Please verify your email",
          });
        }

        req.decoded = {
          ...decoded,
          userId: parentData.id,
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

export const verifyParentToken = verifyParentJwt();
