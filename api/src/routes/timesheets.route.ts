import { Router } from "express"
import timesheetController from "../controllers/timesheet.controller"

const router = Router()
const path = "/timesheets"

router.get(path, timesheetController.list)
router.post(path, timesheetController.create)
router.put(`${path}/:id`, timesheetController.update)
router.delete(`${path}/:id`, timesheetController.delete)

export default router
