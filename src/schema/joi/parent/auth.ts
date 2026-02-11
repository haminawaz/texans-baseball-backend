import Joi from "joi";

export const parentSchemas = {
  playersByTeamCode: Joi.object({
    team_code: Joi.string().required().messages({
      "string.empty": "Team code is required",
      "any.required": "Team code is required",
    }),
  }),

  invitationAccept: Joi.object({
    invitation_token: Joi.string().required().messages({
      "string.empty": "Invitation token is required",
      "any.required": "Invitation token is required",
    }),
  }),

  parentSignup: Joi.object({
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
    player_id: Joi.number().integer().required().messages({
      "number.base": "Player id must be a number",
      "number.integer": "Player id must be an integer",
      "number.required": "Player id is required",
    }),
    relationship: Joi.string()
      .required()
      .valid("parent", "guardian", "grandparent", "sibling", "other")
      .messages({
        "string.empty": "Relationship is required",
        "any.required": "Relationship is required",
        "any.only":
          "Relationship must be one of parent, guardian, grandparent, sibling, other",
      }),
  }),

  parentResetPasswordQuery: Joi.object({
    email: Joi.string().email().required().messages({
      "string.empty": "Email is required",
      "any.required": "Email is required",
    }),
    otp: Joi.string().required().min(6).max(6).messages({
      "string.empty": "OTP is required",
      "any.required": "OTP is required",
    }),
    action: Joi.string().valid("reset", "set").default("reset").messages({
      "any.only": "Action must be reset or set",
    }),
  }),

  playerIdSchema: Joi.object({
    playerId: Joi.number().integer().required().messages({
      "number.base": "Player ID must be a number",
      "number.integer": "Player ID must be an integer",
      "number.required": "Player ID is required",
    }),
  }),
};
