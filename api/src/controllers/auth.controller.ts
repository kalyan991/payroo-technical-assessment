import { Request, Response, NextFunction } from "express"
import authService from "../services/auth.service"


class AuthController {


    async register(req: Request, res: Response) {
        try {
            const user = await authService.register(req.body)
            res.status(201).json({ message: "User created", user })
        } catch (err: any) {
            res.status(400).json({ error: err.message })
        }
    }
    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { user, token } = await authService.login(req.body);
            (req.session as any).user = { id: user.id, email: user.email, token }

            res.status(200).json({
                message: "Login successful",
                user: { email: user.email },
                token,
            })
        } catch (err: any) {
            res.status(400).json({ error: err.message })
        }
    }

    async logout(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await authService.logout(req)
            res.status(200).json(result)
        } catch (err: any) {
            res.status(400).json({ error: err.message })
        }
    }

    async me(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await authService.me(req)
            res.status(200).json(user)
        } catch (err: any) {
            res.status(401).json({ error: err.message })
        }
    }
}

export default new AuthController()
