import prisma from "../lib/prisma"

class EmployeeService {

    async listAll(page = 1, limit = 10) {
        const skip = (page - 1) * limit

        const [employees, total] = await Promise.all([
            prisma.employee.findMany({
                where: { deleted: false },
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
            }),
            prisma.employee.count({ where: { deleted: false } }),
        ])

        return {
            data: employees,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        }
    }

    async create(data: any) {

        if (!data.id) throw new Error("Employee ID is required");
        const exists = await prisma.employee.findUnique({ where: { id: data.id, deleted: false } })
        if (exists) throw new Error("Employee with this ID already exists");

        return prisma.employee.create({
            data: {
                id: data.id,
                firstName: data.firstName,
                lastName: data.lastName,
                type: data.type,
                baseHourlyRate: data.baseHourlyRate,
                superRate: data.superRate,
                bankBsb: data.bank.bsb,
                bankAccount: data.bank.account,
            },
        })
    }


    async update(id: string, data: any) {
        const existing = await prisma.employee.findUnique({ where: { id } })
        if (!existing) throw new Error("Employee not found");

        return prisma.employee.update({
            where: { id },
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                type: data.type,
                baseHourlyRate: data.baseHourlyRate,
                superRate: data.superRate,
                bankBsb: data.bank.bsb,
                bankAccount: data.bank.account,
            },
        })
    }


    async deleteById(empId: string) {
        if (!empId) throw new Error("Employee ID is required");
        const existing = await prisma.employee.findUnique({ where: { id: empId } })
        if (!existing) throw new Error("Employee not found");

        return prisma.employee.update({
            where: { id: empId },
            data: { deleted: true },
        })
    }
}

export default new EmployeeService()
