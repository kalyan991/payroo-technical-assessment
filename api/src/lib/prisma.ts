import { PrismaClient } from "../generated/prisma/client" 

const prisma = new PrismaClient({
  log: ["query", "error", "warn"],
})

export default prisma
