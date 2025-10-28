import { Router } from "express"
import payrunController from "../controllers/payrun.controller"
import validate from "../lib/validate"
import { payrunSchema } from "../validation/payrun.schema"

const router = Router()

router.post("/payruns", validate(payrunSchema), payrunController.create)
router.get("/payruns", payrunController.list)
router.get("/payruns/:id", payrunController.getOne)

export default router
