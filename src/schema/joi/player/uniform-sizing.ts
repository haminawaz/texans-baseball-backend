import Joi from "joi";

const uniformSizingUpdate = Joi.object({
  jersey_size: Joi.string()
    .trim()
    .valid(
      "adult-S",
      "adult-M",
      "adult-L",
      "adult-XL",
      "adult-XXL",
      "adult-XXXL",
      "youth-S",
      "youth-M",
      "youth-L",
      "youth-XL",
      "youth-XXL",
      "youth-XXXL",
    )
    .allow(null, "")
    .messages({
      "any.only": "Invalid jersey size",
    }),
  hat_size: Joi.string()
    .trim()
    .valid("XS/S", "S/M", "M/L", "L/XL")
    .allow(null, "")
    .messages({
      "any.only": "Invalid hat size",
    }),
  helmet_size: Joi.string()
    .trim()
    .valid("rawlings-jr", "rawlings-sr")
    .allow(null, "")
    .messages({
      "any.only": "Invalid helmet size",
    }),
  helmet_side: Joi.string()
    .trim()
    .valid("lefty", "righty")
    .allow(null, "")
    .messages({
      "any.only": "Helmet side must be either 'lefty' or 'righty'",
    }),
  jersey_pants: Joi.string()
    .trim()
    .valid(
      "adult-S",
      "adult-M",
      "adult-L",
      "adult-XL",
      "adult-XXL",
      "adult-XXXL",
      "youth-S",
      "youth-M",
      "youth-L",
      "youth-XL",
      "youth-XXL",
      "youth-XXXL",
    )
    .allow(null, "")
    .messages({
      "any.only": "Invalid jersey pants size",
    }),
  pant_style: Joi.string()
    .trim()
    .valid("knicker", "pants")
    .allow(null, "")
    .messages({
      "any.only": "Invalid pant style",
    }),
  shirt_size: Joi.string()
    .trim()
    .valid(
      "adult-S",
      "adult-M",
      "adult-L",
      "adult-XL",
      "adult-XXL",
      "adult-XXXL",
      "youth-S",
      "youth-M",
      "youth-L",
      "youth-XL",
      "youth-XXL",
      "youth-XXXL",
    )
    .allow(null, "")
    .messages({
      "any.only": "Invalid shirt size",
    }),
  short_size: Joi.string()
    .trim()
    .valid(
      "adult-S",
      "adult-M",
      "adult-L",
      "adult-XL",
      "adult-XXL",
      "adult-XXXL",
      "youth-S",
      "youth-M",
      "youth-L",
      "youth-XL",
      "youth-XXL",
      "youth-XXXL",
    )
    .allow(null, "")
    .messages({
      "any.only": "Invalid short size",
    }),
  youth_belt: Joi.string()
    .trim()
    .valid("M", "L", "XL")
    .allow(null, "")
    .messages({
      "any.only": "Invalid youth belt size",
    }),
  adult_belt: Joi.string().trim().allow(null, ""),
  sock_size: Joi.string()
    .trim()
    .valid("youth", "L", "XL")
    .allow(null, "")
    .messages({
      "any.only": "Invalid sock size",
    }),
  shoe_size: Joi.string().trim().allow(null, ""),
  sweater_jacket: Joi.string().trim().allow(null, ""),
  is_catcher: Joi.boolean().default(false),
  batting_glove: Joi.string()
    .trim()
    .valid(
      "adult-S",
      "adult-M",
      "adult-L",
      "adult-XL",
      "youth-S",
      "youth-M",
      "youth-L",
      "youth-XL",
    )
    .allow(null, "")
    .messages({
      "any.only": "Invalid batting glove size",
      "any.required": "Batting glove is required",
    }),
});

export const playerUniformSizingSchemas = {
  uniformSizingUpdate,
};
