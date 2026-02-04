import Joi from "joi";

export const adminCoachSchemas = {
  inviteCoach: Joi.object({
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
    role: Joi.string()
      .trim()
      .required()
      .valid("coach", "assistant_coach")
      .messages({
        "string.base": "Role must be a string",
        "string.empty": "Role is not allowed to be empty",
        "any.required": "Role is required",
        "any.only": "Role must be either 'coach' or 'assistant_coach'",
      }),
    permission_level: Joi.string()
      .trim()
      .required()
      .valid("read_only", "full_access")
      .messages({
        "string.base": "Permission level must be a string",
        "string.empty": "Permission level is not allowed to be empty",
        "any.required": "Permission level is required",
        "any.only": "Permission level must be either 'read_only' or 'full_access'",
      }),
  }),
  getCoaches: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    pageSize: Joi.number().integer().min(1).max(100).default(10),
    status: Joi.string()
      .valid("accepted", "pending")
      .default("pending")
      .required()
      .messages({
        "any.only": "Status must be either 'accepted' or 'pending'",
        "any.required": "Status is required",
      }),
  }),
  updateCoach: Joi.object({
    team_id: Joi.number().integer().positive().required().messages({
      "any.required": "Team ID is required",
      "number.base": "Team ID must be a number",
    }),
    action: Joi.string().valid("assign", "remove").required().messages({
      "any.only": "Action must be either 'assign' or 'remove'",
      "any.required": "Action is required",
    }),
  }),
};
