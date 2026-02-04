import Joi from "joi";

const createEvent = Joi.object({
  team_id: Joi.number().integer().positive().required().messages({
    "any.required": "Team ID is required",
    "number.base": "Team ID must be a number",
  }),
  event_type: Joi.string()
    .valid("Tournament", "Practice", "Social_Event", "Strength_Conditioning")
    .required()
    .messages({
      "any.required": "Event type is required",
      "any.only":
        "Event type must be Tournament, Practice, Social_Event, or Strength_Conditioning",
    }),
  name: Joi.string().trim().max(100).required().messages({
    "any.required": "Event name is required",
    "string.max": "Event name must be less than 100 characters",
    "string.empty": "Event name is required",
  }),
  start_date: Joi.date().iso().required().messages({
    "date.base": "Start date must be a valid date",
    "any.required": "Start date is required",
  }),
  end_date: Joi.date().iso().allow(null).messages({
    "date.base": "End date must be a valid date",
  }),
  start_time: Joi.string().trim().required().messages({
    "any.required": "Start time is required",
    "string.empty": "Start time is required",
  }),
  end_time: Joi.string().trim().required().messages({
    "any.required": "End time is required",
    "string.empty": "End time is required",
  }),
  location: Joi.string().trim().allow("").max(255).messages({
    "string.max": "Location must be less than 255 characters",
  }),
  address: Joi.string().trim().required().messages({
    "any.required": "Address is required",
    "string.empty": "Address is required",
  }),
  event_link: Joi.string().trim().allow("").uri().messages({
    "string.uri": "Event link must be a valid URL",
  }),
  gamechanger_link: Joi.string().trim().allow("").uri().messages({
    "string.uri": "GameChanger link must be a valid URL",
  }),
  notes: Joi.string().trim().allow(""),
  is_recurring: Joi.boolean().default(false),
  repeat_pattern: Joi.string()
    .valid("Weekly", "Every_Two_Weeks")
    .when("is_recurring", {
      is: true,
      then: Joi.required(),
      otherwise: Joi.allow(null),
    })
    .messages({
      "any.required": "Repeat pattern is required for recurring events",
      "any.only": "Repeat pattern must be 'Weekly' or 'Every_Two_Weeks'",
    }),
  repeat_days: Joi.array()
    .min(1)
    .items(Joi.string().valid("Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"))
    .when("is_recurring", {
      is: true,
      then: Joi.required(),
      otherwise: Joi.allow(null),
    })
    .messages({
      "any.required": "Select at least one day for recurring events",
      "array.min": "Select at least one day",
    }),
  end_recurrence_count: Joi.number().integer().positive().allow(null),
  end_recurrence_date: Joi.date()
    .iso()
    .allow(null)
    .when("end_recurrence_count", {
      is: Joi.number().required(),
      then: Joi.valid(null).messages({
        "any.only": "Cannot specify both recurrence count and end date",
      }),
    }),
  coach_ids: Joi.array()
    .items(Joi.number().integer().positive())
    .unique()
    .default([]),
});

const getEvents = Joi.object({
  teamId: Joi.number().integer().positive().messages({
    "number.base": "Team ID must be a number",
  }),
  date: Joi.date().iso().messages({
    "date.base": "Date must be a valid ISO date",
  }),
});

const updateEventCoaches = Joi.object({
  coach_ids: Joi.array()
    .items(Joi.number().integer().positive())
    .unique()
    .required()
    .messages({
      "any.required": "Coach IDs are required",
      "array.base": "Coach IDs must be an array",
    }),
});

const getTimesheet = Joi.object({
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
  coachId: Joi.number().integer().positive().optional(),
});

export const adminEventSchemas = {
  createEvent,
  getEvents,
  updateEvent: createEvent,
  updateEventCoaches,
  getTimesheet,
};
