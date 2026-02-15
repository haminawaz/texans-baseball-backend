import Joi from "joi";

export const messageSchemas = {
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
    type: Joi.string()
      .valid("one_to_one", "group", "team")
      .default("one_to_one")
      .required()
      .messages({
        "string.empty": "Type cannot be empty",
        "any.only": "Type must be one of: one_to_one, group, team",
        "any.required": "Type is required",
      }),
    team_id: Joi.number()
      .when("type", {
        is: "team",
        then: Joi.required(),
        otherwise: Joi.forbidden(),
      })
      .messages({
        "number.base": "Team ID must be a number",
        "any.required": "Team ID is required for team thread",
        "any.unknown": "Team ID is not allowed for one_to_one or group thread",
      }),
    coaches: Joi.array()
      .items(Joi.number())
      .unique()
      .when("type", {
        is: "team",
        then: Joi.forbidden(),
        otherwise: Joi.optional(),
      })
      .messages({
        "array.base": "Coaches must be an array",
        "array.items": "Coaches must be an array of numbers",
        "array.unique": "Duplicate coach are not allowed",
        "any.unknown": "Coaches are not allowed for team thread",
      }),
    players: Joi.array()
      .items(Joi.number())
      .unique()
      .when("type", {
        is: "team",
        then: Joi.forbidden(),
        otherwise: Joi.optional(),
      })
      .messages({
        "array.base": "Players must be an array",
        "array.items": "Players must be an array of numbers",
        "array.unique": "Duplicate player are not allowed",
        "any.unknown": "Players are not allowed for team thread",
      }),
  }).or("team_id", "coaches", "players"),

  addReaction: Joi.object({
    message_id: Joi.number().required().messages({
      "number.base": "Message ID must be a number",
      "any.required": "Message ID is required",
    }),
    emoji: Joi.string()
      .pattern(/^(\p{Emoji_Presentation}|\p{Extended_Pictographic})+$/u)
      .required()
      .max(10)
      .messages({
        "string.empty": "Emoji cannot be empty",
        "any.required": "Emoji is required",
        "string.max": "Emoji must be at most 10 characters",
        "string.pattern.base": "Only emojis are allowed",
      }),
  }),

  reactionIdSchema: Joi.object({
    reactionId: Joi.number().integer().required().messages({
      "number.base": "Reaction ID must be a number",
      "number.integer": "Reaction ID must be an integer",
      "any.required": "Reaction ID is required",
    }),
  }),

  messageIdSchema: Joi.object({
    messageId: Joi.number().integer().required().messages({
      "number.base": "Message ID must be a number",
      "number.integer": "Message ID must be an integer",
      "any.required": "Message ID is required",
    }),
  }),

  threadIdSchema: Joi.object({
    threadId: Joi.number().integer().required().messages({
      "number.base": "Thread ID must be a number",
      "number.integer": "Thread ID must be an integer",
      "any.required": "Thread ID is required",
    }),
  }),

  getParentPlayerMessageSchema: Joi.object({
    playerId: Joi.number().integer().required().messages({
      "number.base": "Player ID must be a number",
      "number.integer": "Player ID must be an integer",
      "any.required": "Player ID is required",
    }),
    threadId: Joi.number().integer().required().messages({
      "number.base": "Thread ID must be a number",
      "number.integer": "Thread ID must be an integer",
      "any.required": "Thread ID is required",
    }),
  }),
};
