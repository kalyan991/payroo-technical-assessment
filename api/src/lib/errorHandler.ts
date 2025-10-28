import { Request, Response, NextFunction } from "express"
import logger from "./logger"

function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  logger.error(err)
  const status = err.status || 500
  const message = err.message || "Something went wrong"
  res.status(status).json({ error: message })
}

export default errorHandler
