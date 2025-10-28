import { Request, Response, NextFunction } from "express"
import timesheetService from "../services/timesheet.service"

class TimesheetController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 10
      const result = await timesheetService.listAll(page, limit)
      res.status(200).json(result)
    } catch (err) {
      next(err)
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await timesheetService.create(req.body)
      res.status(201).json(result)
    } catch (err) {
      next(err)
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id
      const result = await timesheetService.update(id, req.body)
      res.status(200).json(result)
    } catch (err) {
      next(err)
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id
      const result = await timesheetService.deleteById(id)
      res.status(200).json({ message: "Timesheet deleted successfully", data: result })
    } catch (err) {
      next(err)
    }
  }
}

export default new TimesheetController()
