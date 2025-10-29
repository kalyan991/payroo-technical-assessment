import Joi from "joi"

export const employeeSchema = Joi.object({
  id: Joi.string().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  type: Joi.string().valid("hourly").required(),
  baseHourlyRate: Joi.number().positive().required(),
  superRate: Joi.number().min(0).max(1).required(),
  bank: Joi.object({
    bsb: Joi.string().required(),
    account: Joi.string().required(),
  }).required(),
  stripeAccountId: Joi.string().optional(),
})
