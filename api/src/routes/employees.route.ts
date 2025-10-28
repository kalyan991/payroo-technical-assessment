import { Router } from "express"
import employeeController from "../controllers/employee.controller"
import validate from "../lib/validate"
import { employeeSchema } from "../validation/employee.schema"
import Joi from "joi"

const router = Router()
const path = "/employees"

const bulkSchema = Joi.alternatives().try(
  employeeSchema,
  Joi.array().items(employeeSchema)
)

router.get(path, employeeController.list)
router.post(path, validate(bulkSchema), employeeController.create)
router.put(`${path}/:id`, validate(employeeSchema), employeeController.update)
router.delete(`${path}/:id`, employeeController.deleteEmployee)

export default router