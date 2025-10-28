import Joi from "joi"

export const timesheetEntrySchema = Joi.object({
  date: Joi.string().isoDate().required(),
  start: Joi.string().required(),
  end: Joi.string().required(),
  unpaidBreakMins: Joi.number().integer().min(0).required(),
})

export const timesheetSchema = Joi.object({
  employeeId: Joi.string().required(),
  periodStart: Joi.string().isoDate().required(),
  periodEnd: Joi.string().isoDate().required(),
  entries: Joi.array().items(timesheetEntrySchema).min(1).required(),
  allowances: Joi.number().default(0),
})
