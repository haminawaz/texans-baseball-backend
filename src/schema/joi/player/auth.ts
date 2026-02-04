import Joi from "joi";

const signup = Joi.object({
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
  password: Joi.string().trim().required().min(6).max(30).messages({
    "string.min": "Password must be at least 6 characters long",
    "string.max": "Password must be at most 30 characters long",
    "any.required": "Password is required",
    "string.empty": "Password is not allowed to be empty",
  }),
  confirm_password: Joi.any().valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords do not match",
    "any.required": "Confirm password is required",
  }),
  team_code: Joi.string().trim().required().uppercase().min(6).max(6).messages({
    "string.min": "Team code must be 6 characters long",
    "string.max": "Team code must be 6 characters long",
    "any.required": "Team code is required",
    "string.empty": "Team code is not allowed to be empty",
  }),
});

const loginSchema = Joi.object({
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
  password: Joi.string().trim().required().min(6).max(30).messages({
    "string.min": "Password must be at least 6 characters long",
    "string.max": "Password must be at most 30 characters long",
    "any.required": "Password is required",
    "string.empty": "Password is not allowed to be empty",
  }),
});

const authToken = Joi.object({
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
});

const guardianSchema = Joi.object({
  first_name: Joi.string().trim().required().max(50),
  last_name: Joi.string().trim().required().max(50),
  phone: Joi.string().trim().allow("").max(20),
  email: Joi.string().trim().lowercase().email().required().max(50),
  occupation: Joi.string().trim().allow("").max(100),
  home_address: Joi.string().trim().allow("").max(500),
});

const profileUpdate = Joi.object({
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
  phone: Joi.string().trim().allow("").max(20),
  date_of_birth: Joi.date().iso().allow(null),
  age: Joi.number().integer().min(0).max(100).allow(null),
  high_school_class: Joi.string().trim().allow("").max(20),
  positions: Joi.array().items(Joi.string().trim()).allow(null),
  jersey_number: Joi.number().integer().min(0).max(99).allow(null),
  bat_hand: Joi.string().trim().valid("right", "left", "switch").allow(null),
  throw_hand: Joi.string().trim().valid("right", "left").allow(null),
  height: Joi.string().trim().allow("").max(20),
  weight: Joi.string().trim().allow("").max(20),
  high_school: Joi.string().trim().allow("").max(50),
  sat_score: Joi.number().integer().min(0).max(1600).allow(null),
  act_score: Joi.number().integer().min(0).max(36).allow(null),
  gpa: Joi.number().min(0).max(4.0).allow(null),
  commited_school: Joi.string().trim().allow("").max(50),
  x_handle: Joi.string().trim().allow("").max(50),
  instagram_handle: Joi.string().trim().allow("").max(50),
  facebook_handle: Joi.string().trim().allow("").max(50),
  guardians: Joi.array().items(guardianSchema).max(2).allow(null),
});

const passwordUpdate = Joi.object({
  old_password: Joi.string().trim().min(6).required().messages({
    "string.base": "Old password must be a string",
    "string.min": "Old password must be at least 6 characters",
    "any.required": "Old password is required",
    "string.empty": "Old password is not allowed to be empty",
  }),

  new_password: Joi.string()
    .trim()
    .min(6)
    .disallow(Joi.ref("old_password"))
    .required()
    .messages({
      "string.base": "New password must be a string",
      "string.min": "New password must be at least 6 characters",
      "any.required": "New password is required",
      "string.empty": "New password is not allowed to be empty",
      "any.invalid": "New password must be different from old password",
    }),
});

const forgotPassword = Joi.object({
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
});

const resetPassword = Joi.object({
  password: Joi.string().trim().required().min(6).max(30).messages({
    "string.min": "Password must be at least 6 characters long",
    "string.max": "Password must be at most 30 characters long",
    "any.required": "Password is required",
    "string.empty": "Password is not allowed to be empty",
  }),
  confirm_password: Joi.any().valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords do not match",
    "any.required": "Confirm password is required",
  }),
});

export const playerSchemas = {
  signup,
  login: loginSchema,
  authToken,
  profileUpdate,
  passwordUpdate,
  forgotPassword,
  resetPassword,
};
