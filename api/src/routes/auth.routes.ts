import { Router } from "express"
import authController from "../controllers/auth.controller"
import validate from "../lib/validate"
import { loginSchema, registerSchema } from "../validation/auth.schema"

const router = Router()
const path = "/auth"


router.post(`${path}/register`, validate(registerSchema), authController.register)
router.post(`${path}/login`, validate(loginSchema), authController.login)
router.post(`${path}/logout`, authController.logout)
router.get(`${path}/me`, authController.me)

export default router
