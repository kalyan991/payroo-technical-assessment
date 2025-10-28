import Joi from "joi"

export const payrunSchema = Joi.object({
  periodStart: Joi.string().isoDate().required(),
  periodEnd: Joi.string().isoDate().required(),
  employeeIds: Joi.array().items(Joi.string()).optional(),
})
