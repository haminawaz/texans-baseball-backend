import Joi from "joi";

export const adminPlayerSchemas = {
  getPlayerListSchema: Joi.object({
    name: Joi.string().optional().allow(""),
    teamId: Joi.number().integer().optional(),
    position: Joi.string().optional().allow(""),
  }),
};
