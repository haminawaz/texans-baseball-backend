import Joi from "joi";

export const commonSchemas = {
  paginationSchema: Joi.object({
    page: Joi.number().integer().min(1).default(1).messages({
      "number.base": "Page must be a number",
      "number.integer": "Page must be an integer",
      "number.min": "Page must be at least 1",
    }),
    pageSize: Joi.number().integer().min(1).max(100).default(10).messages({
      "number.base": "Page size must be a number",
      "number.integer": "Page size must be an integer",
      "number.min": "Page size must be at least 1",
      "number.max": "Page size must be at most 100",
    }),
  }),

  idSchema: Joi.object({
    id: Joi.number().integer().required().messages({
      "number.base": "ID must be a number",
      "number.integer": "ID must be an integer",
      "number.required": "ID is required",
    }),
  }),

  sendMessage: Joi.object({
    thread_id: Joi.number().required().messages({
      "number.base": "Thread ID must be a number",
      "any.required": "Thread ID is required",
    }),
    message: Joi.string().required().min(1).max(1000).messages({
      "string.empty": "Message cannot be empty",
      "any.required": "Message is required",
      "string.max": "Message must be at most 1000 characters",
    }),
  }),

  createThread: Joi.object({
    type: Joi.string().valid("one_to_one", "group", "team").default("one_to_one").messages({
      "string.empty": "Type cannot be empty",
      "any.only": "Type must be one of: one_to_one, group, team",
    }),
    team_id: Joi.number().optional().allow(null).messages({
      "number.base": "Team ID must be a number",
    }),
    coaches: Joi.array().items(Joi.number()).optional().messages({
      "array.base": "Coaches must be an array",
      "array.items": "Coaches must be an array of numbers",
    }),
    players: Joi.array().items(Joi.number()).optional().messages({
      "array.base": "Players must be an array",
      "array.items": "Players must be an array of numbers",
    }),
  }),

  addReaction: Joi.object({
    message_id: Joi.number().required().messages({
      "number.base": "Message ID must be a number",
      "any.required": "Message ID is required",
    }),
    emoji: Joi.string().required().max(10).messages({
      "string.empty": "Emoji cannot be empty",
      "any.required": "Emoji is required",
      "string.max": "Emoji must be at most 10 characters",
    }),
  }),
};
