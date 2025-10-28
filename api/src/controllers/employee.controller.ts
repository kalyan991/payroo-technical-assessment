import { Request, Response, NextFunction } from "express"
import employeeService from "../services/employee.service"

class EmployeeController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 10
      const employees = await employeeService.listAll(page, limit)
      res.status(200).json(employees)
    } catch (err) {
      next(err)
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body
      if (Array.isArray(body)) {
        const results = []
        for (const emp of body) {
          const result = await employeeService.create(emp)
          results.push(result)
        }
        res.status(201).json(results)
      } else {
        const result = await employeeService.create(body)
        res.status(201).json(result)
      }
    } catch (err) {
      next(err)
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const empId = req.params.id
      const result = await employeeService.update(empId, req.body)
      res.status(200).json(result)
    } catch (err) {
      next(err)
    }
  }

  async deleteEmployee(req: Request, res: Response, next: NextFunction) {
    try {
      const empId = req.params.id
      const deletedEmp = await employeeService.deleteById(empId)
      res.status(200).json({ message: "Employee deleted successfully", data: deletedEmp })
    } catch (error) {
      next(error)
    }
  }
}

export default new EmployeeController()
