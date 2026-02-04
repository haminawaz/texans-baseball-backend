import Joi from "joi";

const createTryout = Joi.object({
  name: Joi.string().trim().required().max(100).messages({
    "string.empty": "Name is required",
    "string.max": "Name must be less than 100 characters",
  }),
  team_id: Joi.number().integer().required().messages({
    "number.empty": "Team ID is required",
    "number.base": "Team ID must be a number",
  }),
  age_group: Joi.string().trim().required().max(50).messages({
    "string.empty": "Age group is required",
    "string.max": "Age group must be less than 50 characters",
  }),
  date: Joi.date().iso().required().messages({
    "date.empty": "Date is required",
    "date.base": "Date must be a valid date",
  }),
  time: Joi.string().trim().required().max(20).messages({
    "string.empty": "Time is required",
    "string.max": "Time must be less than 20 characters",
  }),
  address: Joi.string().trim().required().messages({
    "string.empty": "Address is required",
  }),
  registration_deadline: Joi.date().required().messages({
    "date.empty": "Registration deadline is required",
    "date.base": "Registration deadline must be a valid date and time",
  }),
  notes: Joi.string().trim().allow("").max(500).messages({
    "string.max": "Notes must be less than 500 characters",
  }),
});

const updateTryout = Joi.object({
  name: Joi.string().trim().max(100).messages({
    "string.max": "Name must be less than 100 characters",
  }),
  team_id: Joi.number().integer().messages({
    "number.base": "Team ID must be a number",
  }),
  age_group: Joi.string().trim().max(50).messages({
    "string.max": "Age group must be less than 50 characters",
  }),
  date: Joi.date().iso().messages({
    "date.base": "Date must be a valid date",
  }),
  time: Joi.string().trim().max(20).messages({
    "string.max": "Time must be less than 20 characters",
  }),
  address: Joi.string().trim().messages({
    "string.empty": "Address is required",
  }),
  registration_deadline: Joi.date().messages({
    "date.base": "Registration deadline must be a valid date and time",
  }),
  notes: Joi.string().trim().allow("").max(500).messages({
    "string.max": "Notes must be less than 500 characters",
  }),
});

export const tryoutSchemas = {
  createTryout,
  updateTryout,
};
