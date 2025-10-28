import { Request, Response, NextFunction } from "express"
import payslipService from "../services/payslip.service"

class PayslipController {
  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const employeeIdValue = req.params.employeeId
      const payrunIdValue = req.params.payrunId
      console.log(employeeIdValue);
      console.log(payrunIdValue);
      const result = await payslipService.getPayslipByEmployee(payrunIdValue, employeeIdValue)
      res.status(200).json(result)
    } catch (err) {
      next(err)
    }
  }
}

export default new PayslipController()
