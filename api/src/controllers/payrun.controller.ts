import { Request, Response, NextFunction } from "express"
import payrunService from "../services/payrun.service"

class PayrunController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await payrunService.generate(req.body)
      res.status(201).json(result)
    } catch (err) {
      next(err)
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const runs = await payrunService.listAll()
      res.status(200).json(runs)
    } catch (err) {
      next(err)
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await payrunService.getById(req.params.id)
      res.status(200).json(result)
    } catch (err) {
      next(err)
    }
  }
}

export default new PayrunController()
