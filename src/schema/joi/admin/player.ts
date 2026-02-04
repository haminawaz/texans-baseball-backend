import Joi from "joi";

export const adminPlayerSchemas = {
  getPlayerListSchema: Joi.object({
    name: Joi.string().optional().allow(""),
    teamId: Joi.number().integer().optional(),
    position: Joi.string().optional().allow(""),
  }),

  assignPlayerTeam: Joi.object({
    team_id: Joi.number().integer().required().messages({
      "any.required": "Team ID is required",
      "number.base": "Team ID must be a number",
    }),
  }),
};
