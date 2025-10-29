import prisma from "../lib/prisma"
import { zonedTimeToUtc } from 'date-fns-tz'

class TimesheetService {

  async listAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit

    const [timesheets, total] = await Promise.all([
      prisma.timesheet.findMany({
        include: { entries: true, employee: true },
        orderBy: { periodStart: "desc" },
        skip,
        take: limit,
      }),
      prisma.timesheet.count(),
    ])

    return {
      data: timesheets,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    }
  }


  async create(data: any) {
    const periodStartDate = zonedTimeToUtc(data.periodStart, 'Australia/Melbourne')
    const periodEndDate = zonedTimeToUtc(data.periodEnd, 'Australia/Melbourne')

    const employeeRecord = await prisma.employee.findUnique({
      where: { id: data.employeeId },
    })
    if (!employeeRecord) {
      throw new Error(`Employee not found with id: ${data.employeeId}`)
    }

    const payrunRecord = await prisma.payrun.findFirst({
      where: {
        payslips: {
          some: {
            employeeId: data.employeeId,
          },
        },
        periodStart: { lte: periodEndDate },
        periodEnd: { gte: periodStartDate },
      },
    })
    if (payrunRecord) {
      throw new Error("Cannot create timesheet — payrun already processed for this period.")
    }

    const existing = await prisma.timesheet.findFirst({
      where: {
        employeeId: data.employeeId,
        periodStart: periodStartDate,
        periodEnd: periodEndDate,
      },
    })
    if (existing) {
      throw new Error("Timesheet already exists for this employee and period.")
    }

    for (const entry of data.entries) {
      const entryDate = zonedTimeToUtc(entry.date, 'Australia/Melbourne')
      if (entryDate < periodStartDate || entryDate > periodEndDate) {
        throw new Error(
          `Entry date ${entry.date} falls outside the period ${data.periodStart} - ${data.periodEnd}`
        )
      }
    }

    const newSheet = await prisma.timesheet.create({
      data: {
        employeeId: data.employeeId,
        periodStart: periodStartDate,
        periodEnd: periodEndDate,
        allowances: data.allowances || 0,
        entries: {
          create: data.entries.map((e: any) => ({
            date: zonedTimeToUtc(e.date, 'Australia/Melbourne'),
            start: e.start,
            end: e.end,
            unpaidBreakMins: e.unpaidBreakMins || 0,
          })),
        },
      },
      include: { entries: true },
    })

    return newSheet
  }


  async update(id: string, data: any) {
    const periodStartDate = zonedTimeToUtc(data.periodStart, 'Australia/Melbourne')
    const periodEndDate = zonedTimeToUtc(data.periodEnd, 'Australia/Melbourne')
    const existingSheet = await prisma.timesheet.findUnique({
      where: { id },
      include: { entries: true },
    })
    if (!existingSheet) {
      throw new Error("Timesheet not found")
    }

    const payrunRecord = await prisma.payrun.findFirst({
      where: {
        periodStart: { lte: periodEndDate },
        periodEnd: { gte: periodStartDate },
      },
    })
    if (payrunRecord) {
      throw new Error("Cannot modify timesheet — payrun already processed for this period.")
    }

    for (const entry of data.entries) {
      const entryDate = zonedTimeToUtc(entry.date, 'Australia/Melbourne')
      if (entryDate < periodStartDate || entryDate > periodEndDate) {
        throw new Error(
          `Entry date ${entry.date} falls outside the period ${data.periodStart} - ${data.periodEnd}`
        )
      }
    }

    await prisma.timesheetEntry.deleteMany({
      where: { timesheetId: id },
    })

    const updated = await prisma.timesheet.update({
      where: { id },
      data: {
        allowances: data.allowances || 0,
        periodStart: periodStartDate,
        periodEnd: periodEndDate,
        entries: {
          create: data.entries.map((e: any) => ({
            date: zonedTimeToUtc(e.date, 'Australia/Melbourne'),
            start: e.start,
            end: e.end,
            unpaidBreakMins: e.unpaidBreakMins || 0,
          })),
        },
      },
      include: { entries: true },
    })

    return updated
  }


  async deleteById(id: string) {
    const existing = await prisma.timesheet.findUnique({ where: { id } })
    if (!existing) throw new Error("Timesheet not found")

    const payrunRecord = await prisma.payrun.findFirst({
      where: {
        periodStart: { lte: existing.periodEnd },
        periodEnd: { gte: existing.periodStart },
      },
    })
    if (payrunRecord) {
      throw new Error("Cannot delete timesheet as the payrun has already processed for this period.")
    }

    await prisma.timesheetEntry.deleteMany({
      where: { timesheetId: id },
    })

    return prisma.timesheet.delete({ where: { id } })
  }
}

export default new TimesheetService()
