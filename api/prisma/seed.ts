import "dotenv/config"    
import prisma from "../src/lib/prisma"

async function main() {
  await prisma.employee.createMany({
    data: [
      {
        id: "e-alice",
        firstName: "Alice",
        lastName: "Chen",
        type: "hourly",
        baseHourlyRate: 35,
        superRate: 0.115,
        bankBsb: "083-123",
        bankAccount: "12345678",
      },
      {
        id: "e-bob",
        firstName: "Bob",
        lastName: "Singh",
        type: "hourly",
        baseHourlyRate: 48,
        superRate: 0.115,
        bankBsb: "062-000",
        bankAccount: "98765432",
      },
    ],
  })
  console.log("Seed data for employees has been  inserted")
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
