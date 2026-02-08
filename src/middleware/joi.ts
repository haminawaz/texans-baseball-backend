import Joi from "joi";
import { ParsedQs } from "qs";
import { Request, Response, NextFunction } from "express";
import Validators from "../schema/joi/index";

type Validator = keyof typeof Validators;

const _validate = async (
  data: unknown,
  validator: Validator
): Promise<unknown> => {
  try {
    const schema = Validators[validator] as Joi.Schema;
    const validated = await schema.validateAsync(data, { abortEarly: false });
    return validated;
  } catch (err: unknown) {
    if (err instanceof Joi.ValidationError) {
      const errors = err.details.reduce(
        (acc: Record<string, string[]>, detail) => {
          const key = detail.path[0]?.toString() ?? "unknown";
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push(detail.message);
          return acc;
        },
        {}
      );

      throw { status: 400, message: "Invalid format", error: errors };
    }

    throw {
      status: 500,
      message: "Internal server error",
      error: err instanceof Error ? err.message : err,
    };
  }
};

const bodyValidator = (validator: Validator) => {
  if (!Object.prototype.hasOwnProperty.call(Validators, validator)) {
    throw new Error(`'${validator}' validator doesn't exist`);
  }

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.headers["content-type"]?.includes("multipart/form-data")) {
        for (const key in req.body) {
          const value = req.body[key];
          if (typeof value === "string") {
            const trimmedValue = value.trim();
            if (
              (trimmedValue.startsWith("[") && trimmedValue.endsWith("]")) ||
              (trimmedValue.startsWith("{") && trimmedValue.endsWith("}"))
            ) {
              try {
                req.body[key] = JSON.parse(trimmedValue);
              } catch (e) {
              }
            }
          }
        }
      }
      req.body = await _validate(req.body, validator);
      return next();
    } catch (error: unknown) {
      const status =
        typeof error === "object" && error && "status" in error
          ? (error as { status: number }).status
          : 500;
      const message =
        typeof error === "object" && error && "message" in error
          ? (error as { message: string }).message
          : "Unexpected error";
      const err =
        typeof error === "object" && error && "error" in error
          ? (error as { error: string }).error
          : error;

      return res.status(status).json({
        message,
        error: err,
        response: null,
      });
    }
  };
};

const queryValidator = (validator: Validator) => {
  if (!Object.prototype.hasOwnProperty.call(Validators, validator)) {
    throw new Error(`'${validator}' validator doesn't exist`);
  }

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.query.email && typeof req.query.email === "string") {
        req.query.email = req.query.email.replace(/ /g, "+");
      }
      if (req.query.old_email && typeof req.query.old_email === "string") {
        req.query.old_email = req.query.old_email.replace(/ /g, "+");
      }
      req.query = (await _validate(req.query, validator)) as ParsedQs;
      return next();
    } catch (error: unknown) {
      const status =
        typeof error === "object" && error && "status" in error
          ? (error as { status: number }).status
          : 500;
      const message =
        typeof error === "object" && error && "message" in error
          ? (error as { message: string }).message
          : "Unexpected error";
      const err =
        typeof error === "object" && error && "error" in error
          ? (error as { error: string }).error
          : error;

      return res.status(status).json({
        message,
        error: err,
        response: null,
      });
    }
  };
};

const paramsValidator = (validator: Validator) => {
  if (!Object.prototype.hasOwnProperty.call(Validators, validator)) {
    throw new Error(`'${validator}' validator doesn't exist`);
  }

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.params = (await _validate(
        req.params,
        validator
      )) as typeof req.params;
      return next();
    } catch (error: unknown) {
      const status =
        typeof error === "object" && error && "status" in error
          ? (error as { status: number }).status
          : 500;
      const message =
        typeof error === "object" && error && "message" in error
          ? (error as { message: string }).message
          : "Unexpected error";
      const err =
        typeof error === "object" && error && "error" in error
          ? (error as { error: string }).error
          : error;

      return res.status(status).json({
        message,
        error: err,
        response: null,
      });
    }
  };
};

export { bodyValidator, queryValidator, paramsValidator };
