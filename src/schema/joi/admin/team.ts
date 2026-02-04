import Joi from "joi";

export const adminTeamSchemas = {
  createTeam: Joi.object({
    team_name: Joi.string().trim().required().messages({
      "any.required": "Team name is required",
    }),
    age_group: Joi.string().trim().required().messages({
      "any.required": "Age group is required",
    }),
    coach_ids: Joi.array().items(Joi.number().integer()).unique().optional(),
  }),
  updateTeam: Joi.object({
    team_name: Joi.string().trim(),
    age_group: Joi.string().trim(),
    coach_ids: Joi.array().items(Joi.number().integer()).unique().optional(),
  }),
};
