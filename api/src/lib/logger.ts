import pino from "pino"

const logger = pino({
  transport: {
    target: "pino-pretty",
    options: { colorize: true, translateTime: "HH:MM:ss" },
  },
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
})

export default logger
