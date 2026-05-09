import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  const hash = async (pw: string) => bcrypt.hash(pw, 10)

  // --- ADMIN ---
  const admin = await prisma.user.upsert({
    where: { email: "admin@incentivos.com" },
    update: {},
    create: {
      email: "admin@incentivos.com",
      passwordHash: await hash("admin1234"),
      name: "Admin",
      role: "ADMIN",
    },
  })
  console.log("✅ Admin:", admin.email)

  // --- EMPRESA ---
  const empresa = await prisma.user.upsert({
    where: { email: "desuetudoproject@hotmail.com" },
    update: {},
    create: {
      email: "desuetudoproject@hotmail.com",
      passwordHash: await hash("empresa1234"),
      name: "Restaurante Demo",
      role: "EMPRESA",
    },
  })

  await prisma.business.upsert({
    where: { userId: empresa.id },
    update: {},
    create: {
      userId: empresa.id,
      name: "DProject's",
      type: "RESTAURANTE",
      description: "Plataforma de incentivos anónimos — demo oficial",
      address: "Carrer del Born 12, Palma de Mallorca",
    },
  })
  console.log("✅ Empresa:", empresa.email)

  // --- CAPTADOR ---
  const captador = await prisma.user.upsert({
    where: { email: "captador@incentivos.com" },
    update: {},
    create: {
      email: "captador@incentivos.com",
      passwordHash: await hash("captador1234"),
      name: "Carlos López",
      role: "CAPTADOR",
      phone: "+34600123456",
    },
  })

  // Wallet for captador
  await prisma.wallet.upsert({
    where: { userId: captador.id },
    update: {},
    create: { userId: captador.id, balance: 0 },
  })
  console.log("✅ Captador:", captador.email)

  // --- STAFF ---
  const staff = await prisma.user.upsert({
    where: { email: "staff@incentivos.com" },
    update: {},
    create: {
      email: "staff@incentivos.com",
      passwordHash: await hash("staff1234"),
      name: "María García",
      role: "STAFF",
    },
  })
  console.log("✅ Staff:", staff.email)

  // --- CAMPAIGN ---
  const business = await prisma.business.findUnique({ where: { userId: empresa.id } })
  if (business) {
    const campaign = await prisma.campaign.upsert({
      where: { id: "demo-campaign-1" },
      update: {},
      create: {
        id: "demo-campaign-1",
        businessId: business.id,
        title: "Campaña Verano 2026",
        description: "Trae clientes a nuestra terraza de verano y gana 15€ por reserva confirmada",
        incentiveType: "FIXED",
        incentiveValue: 15,
        status: "ACTIVE",
        startDate: new Date("2026-06-01"),
        endDate: new Date("2026-09-30"),
        maxReservations: 100,
      },
    })
    console.log("✅ Campaign:", campaign.title)
  }

  console.log("\n🎉 Seed completado!\n")
  console.log("Credenciales de prueba:")
  console.log("  Admin:    admin@incentivos.com     / admin1234")
  console.log("  Empresa:  desuetudoproject@hotmail.com / empresa1234")
  console.log("  Captador: captador@incentivos.com  / captador1234")
  console.log("  Staff:    staff@incentivos.com     / staff1234")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
