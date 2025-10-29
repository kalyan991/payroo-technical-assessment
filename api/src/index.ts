import express from "express"
import cors from "cors"
import helmet from "helmet"
import dotenv from "dotenv"
import logger from "./lib/logger"
import errorHandler from "./lib/errorHandler"
import employeeRoutes from "./routes/employees.route"
import timesheetRoutes from "./routes/timesheets.route"
import payrunRoutes from "./routes/payruns.route"
import payslipRoutes from "./routes/payslips.route"
import sessionMiddleware from "./lib/session"
import authRoutes from "./routes/auth.routes"

process.env.TZ = "Australia/Melbourne"
dotenv.config()

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "https://d1sxhpkkj1omwr.cloudfront.net",
]

const corsOptions: cors.CorsOptions = {
  origin(origin, cb) {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["content-type", "authorization", "x-agent-id", "x-customer-id"],
  maxAge: 86400,
};

const app = express()


app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
)

app.use(cors(corsOptions))
app.options(/(.*)/, cors(corsOptions));

app.use(express.json())


app.use(sessionMiddleware)


app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" })
})

app.use(employeeRoutes)
app.use(timesheetRoutes)
app.use(payrunRoutes)
app.use(payslipRoutes)
app.use(authRoutes)

app.use(errorHandler)

export default app

if (process.env.NODE_ENV !== "test" && process.env.NODE_ENV !== "lambda") {
  const PORT = process.env.PORT || 4000
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`)
  })
}
