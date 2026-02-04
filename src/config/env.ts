import dotenv from "dotenv";

dotenv.config();

interface Config {
  nodeEnv: string;
  port: number;
  databaseUrl: string;
  jwtSecret: string;
  salt: string;
  corsOrigin: string;
  frontendBaseUrl: string;
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
  gmailUser: string;
  gmailPassword: string;
}

const config: Config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "3000", 10),
  databaseUrl: process.env.DATABASE_URL as string,
  jwtSecret: process.env.JWT_SECRET as string,
  salt: process.env.USER_PASSWORD_SALT as string,
  corsOrigin: process.env.CORS_ORIGIN as string,
  frontendBaseUrl: process.env.FRONTEND_BASE_URL as string,
  gmailUser: process.env.GMAIL_USER as string,
  gmailPassword: process.env.GMAIL_PASSWORD as string,
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS as string, 10),
  rateLimitMaxRequests: parseInt(
    process.env.RATE_LIMIT_MAX_REQUESTS as string,
    10
  ),
};

export default config;
