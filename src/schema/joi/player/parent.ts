import Joi from "joi";

export const addParentSchema = Joi.object({
  first_name: Joi.string().required().messages({
    "string.empty": "First name is required",
    "any.required": "First name is required",
  }),
  last_name: Joi.string().required().messages({
    "string.empty": "Last name is required",
    "any.required": "Last name is required",
  }),
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "any.required": "Email is required",
    "string.email": "Email is invalid",
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
});

export const updateParentSchema = Joi.object({
  first_name: Joi.string().optional(),
  last_name: Joi.string().optional(),
  email: Joi.string().email().optional(),
  relationship: Joi.string().optional(),
});
