import { calculateGross, calculateHours, calculateNet, calculateSuper, calculateTax } from "../domain/payrunLogic"
import prisma from "../lib/prisma"
import { zonedTimeToUtc, formatInTimeZone } from 'date-fns-tz'
import { generateAndUploadPayslipPDF } from "../lib/payslipPdfUploader"
import { createTransfer } from "./stripe.service"
import { PaymentStatus } from "@prisma/client"

class PayrunService {
  async generate(data: any) {
    const periodStartDate = zonedTimeToUtc(data.periodStart, "Australia/Melbourne")
    const periodEndDate = zonedTimeToUtc(data.periodEnd, "Australia/Melbourne")

    const existingPayrun = await prisma.payrun.findFirst({
      where: {
        OR: [
          { periodStart: { lte: periodEndDate }, periodEnd: { gte: periodStartDate } },
        ],
      },
    })
    if (existingPayrun) throw new Error("A payrun already exists for or overlaps this period.")

    const timesheets = await prisma.timesheet.findMany({
      where: {
        periodStart: { gte: periodStartDate },
        periodEnd: { lte: periodEndDate },
        status: "UNPROCESSED",
      },
      include: { employee: true, entries: true },
    })
    if (timesheets.length === 0) throw new Error("No unprocessed timesheets found for this date range.")

    const payslipsData = timesheets.map((sheet) => {
      const { normalHours, overtimeHours } = calculateHours(sheet.entries)
      const gross = calculateGross(normalHours, overtimeHours, sheet.employee.baseHourlyRate, sheet.allowances)
      const tax = calculateTax(gross)
      const superAmt = calculateSuper(gross)
      const net = calculateNet(gross, tax)
      return {
        employeeId: sheet.employeeId,
        normalHours,
        overtimeHours,
        gross,
        tax,
        super: superAmt,
        net,
        paymentStatus: "PENDING",
      }
    })
    if (payslipsData.length === 0) throw new Error("No payable hours found in this range.")

    const totalGross = payslipsData.reduce((a, p) => a + p.gross, 0)
    const totalTax = payslipsData.reduce((a, p) => a + p.tax, 0)
    const totalSuper = payslipsData.reduce((a, p) => a + p.super, 0)
    const totalNet = payslipsData.reduce((a, p) => a + p.net, 0)

    const label = `PR-${formatInTimeZone(periodStartDate, "Australia/Melbourne", "yyyy-MM-dd")}-${formatInTimeZone(
      periodEndDate,
      "Australia/Melbourne",
      "yyyy-MM-dd"
    )}`

    const payrun = await prisma.payrun.create({
      data: {
        periodStart: periodStartDate,
        periodEnd: periodEndDate,
        totalGross,
        totalTax,
        totalSuper,
        totalNet,
        timesheetIds: timesheets.map((t) => t.id),
      },
    })

    await prisma.payslip.createMany({
      data: payslipsData.map((p) => ({
        ...p,
        payrunId: payrun.id,
        paymentStatus: PaymentStatus.PENDING,
      })),
    })

    const fullPayrun = await prisma.payrun.findUnique({
      where: { id: payrun.id },
      include: { payslips: { include: { employee: true } } },
    })

    await prisma.timesheet.updateMany({
      where: { id: { in: timesheets.map((t) => t.id) } },
      data: { status: "PROCESSED", payrunId: payrun.id },
    })

    for (const slip of fullPayrun!.payslips) {
      let updatedSlip = slip

      if (slip.employee.stripeAccountId) {
        try {
          const transfer = await createTransfer({
            amountInCents: Math.round(slip.net * 100),
            currency: "usd",
            destination: slip.employee.stripeAccountId,
            description: `Payrun ${label} - ${slip.employee.firstName} ${slip.employee.lastName}`,
          })

          updatedSlip = await prisma.payslip.update({
            where: { id: slip.id },
            data: { stripeTransferId: transfer.id, paymentStatus: "PAID" },
            include: { employee: true },
          })
        } catch (error) {
          console.error(`❌ Transfer failed for ${slip.employeeId}:`, error)
          continue
        }
      } else {
        console.log(`No Stripe account for employee ${slip.employeeId}`)
      }

      await generateAndUploadPayslipPDF(updatedSlip, periodStartDate, periodEndDate)
    }


    return {
      message: "Payrun generated successfully.",
      payrunName: label,
      payrun: fullPayrun,
    }
  }

  async listAll() {
    return prisma.payrun.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        payslips: {
          include: {
            employee: { select: { firstName: true, lastName: true } },
          },
        },
      },
    })
  }

  async getById(id: string) {
    const payrun = await prisma.payrun.findUnique({
      where: { id },
      include: {
        payslips: {
          include: {
            employee: { select: { firstName: true, lastName: true } },
          },
        },
      },
    })
    if (!payrun) throw new Error("Payrun not found")
    return payrun
  }
}

export default new PayrunService()
