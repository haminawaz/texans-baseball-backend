import Joi from "joi";

const coachUniformSizingUpdate = Joi.object({
  hat_size: Joi.string()
    .trim()
    .valid("XS/S", "S/M", "M/L", "L/XL")
    .allow(null, "")
    .messages({
      "any.only": "Invalid hat size",
    }),
  shirt_size: Joi.string()
    .trim()
    .valid("XS", "S", "M", "L", "XL", "XXL", "XXXL")
    .allow(null, "")
    .messages({
      "any.only": "Invalid shirt size",
    }),
  short_size: Joi.string()
    .trim()
    .valid("XS", "S", "M", "L", "XL", "XXL", "XXXL")
    .allow(null, "")
    .messages({
      "any.only": "Invalid short size",
    }),
  long_sleeves: Joi.string()
    .trim()
    .valid("XS", "S", "M", "L", "XL", "XXL", "XXXL")
    .allow(null, "")
    .messages({
      "any.only": "Invalid long sleeves size",
    }),
  hoodie_size: Joi.string()
    .trim()
    .valid("XS", "S", "M", "L", "XL", "XXL", "XXXL")
    .allow(null, "")
    .messages({
      "any.only": "Invalid hoodie size",
    }),
});

export const coachUniformSizingSchemas = {
  coachUniformSizingUpdate,
};
