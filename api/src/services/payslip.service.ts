import prisma from "../lib/prisma"

class PayslipService {
  async getPayslipByEmployee(payrunIdValue: string, employeeIdValue: string) {
    const payslipData = await prisma.payslip.findFirst({
      where: { payrunId: payrunIdValue, employeeId: employeeIdValue },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            baseHourlyRate: true,
            superRate: true,
            bankBsb: true,
            bankAccount: true,
          },
        },
        payrun: {
          select: {
            id: true,
            periodStart: true,
            periodEnd: true,
            createdAt: true,
          },
        },
      },
    })

    if (!payslipData) {
      throw new Error("Payslip not found for this employee and payrun.")
    }

    return payslipData
  }
}

export default new PayslipService()
