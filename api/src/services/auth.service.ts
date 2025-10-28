import prisma from "../lib/prisma"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey"

class AuthService {

    async register(data: { email: string; password: string }) {
        if (!data.email || !data.password) throw new Error("Email and password required");

        const existing = await prisma.user.findUnique({ where: { email: data.email } })
        if (existing) throw new Error("User already exists");

        const user = await prisma.user.create({
            data: {
                email: data.email,
                password: data.password,
                enabled: true,
            },
        })

        return user
    }

    async login(data: any) {
        const { email, password } = data

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) throw new Error("Invalid credentials");

        if (!user.enabled) throw new Error("Account disabled");

        if (user.password !== password) throw new Error("Invalid credentials");

        const token = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: "1h" }
        )

        return { user, token }
    }

    async logout(req: any) {
        req.session.destroy(() => { })
        return { message: "Logged out" }
    }

    async me(req: any) {
        if (!req.session.user) throw new Error("Not logged in");
        return req.session.user
    }
}

export default new AuthService()
