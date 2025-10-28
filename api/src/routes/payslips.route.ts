import { Router } from "express"
import payslipController from "../controllers/payslip.controller"

const router = Router()

router.get("/payslips/:employeeId/:payrunId", payslipController.getOne)

export default router
