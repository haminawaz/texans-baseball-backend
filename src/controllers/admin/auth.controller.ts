import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../../middleware/errorHandler";
import adminQueries from "../../queries/admin/auth";
import configs from "../../config/env";

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const admin = await adminQueries.adminLogin(email);
  if (!admin) {
    return res.status(401).json({
      message: "Invalid credentials",
      response: null,
      error: "Invalid credentials",
    });
  }

  const isValid = await bcrypt.compare(password, admin.password);
  if (!isValid) {
    return res.status(401).json({
      message: "Invalid credentials",
      response: null,
      error: "Invalid credentials",
    });
  }

  const token = jwt.sign({ email }, configs.jwtSecret, {
    expiresIn: "24h",
  });

  const data = {
    data: {
      email,
    },
    token,
  };

  return res.status(200).json({
    message: "Admin logged in successfully",
    response: data,
    error: null,
  });
});
