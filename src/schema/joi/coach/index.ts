import Joi from "joi";


const coachProfileUpdate = Joi.object({
  first_name: Joi.string().trim().required().min(2).max(50).messages({
    "string.min": "First name must be at least 2 characters long",
    "string.max": "First name must be at most 50 characters long",
    "any.required": "First name is required",
    "string.empty": "First name is not allowed to be empty",
  }),
  last_name: Joi.string().trim().required().min(2).max(50).messages({
    "string.min": "Last name must be at least 2 characters long",
    "string.max": "Last name must be at most 50 characters long",
    "any.required": "Last name is required",
    "string.empty": "Last name is not allowed to be empty",
  }),
  phone: Joi.string().trim().allow("").max(20)
});

const coachPasswordUpdate = Joi.object({
  email: Joi.string()
    .trim()
    .lowercase()
    .email({ minDomainSegments: 2 })
    .required()
    .messages({
      "string.email": "Enter a valid email address",
      "any.required": "Email is required",
      "string.empty": "Email is not allowed to be empty",
    }),
  otp: Joi.string().trim().required().min(6).max(6).messages({
    "string.min": "OTP must be at least 6 characters long",
    "string.max": "OTP must be at most 6 characters long",
    "any.required": "OTP is required",
    "string.empty": "OTP is not allowed to be empty",
  }),
  action: Joi.string().trim().default("reset").valid("reset", "set").messages({
    "any.only": "Action must be reset or set",
    "string.empty": "Action is not allowed to be empty",
  }),
});

const getCoachTimesheet = Joi.object({
  period: Joi.string()
    .valid("this_week", "this_month", "custom")
    .default("this_week"),
  startDate: Joi.date().iso().when("period", {
    is: "custom",
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
  endDate: Joi.date().iso().when("period", {
    is: "custom",
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
});

export const coachSchemas = {
  coachProfileUpdate,
  coachPasswordUpdate,
  getCoachTimesheet,
};
