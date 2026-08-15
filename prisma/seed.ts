import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

// Today: 2026-06-19 (current date context)
const NOW = new Date("2026-06-19T12:00:00Z")
const daysAgo = (d: number) => new Date(NOW.getTime() - d * 86400_000)
const hoursAgo = (h: number) => new Date(NOW.getTime() - h * 3600_000)

async function main() {
  console.log("🌱 Seeding database...")
  const hash = (pw: string) => bcrypt.hash(pw, 10)

  // ── ADMIN ─────────────────────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: "admin@incentivos.com" },
    update: {},
    create: { email: "admin@incentivos.com", passwordHash: await hash("admin1234"), name: "Admin", role: "ADMIN" },
  })
  console.log("✅ Admin:", admin.email)

  // ── EMPRESA ───────────────────────────────────────────────────────────────
  const empresa = await prisma.user.upsert({
    where: { email: "empresa@incentivos.com" },
    update: {},
    create: { email: "empresa@incentivos.com", passwordHash: await hash("empresa1234"), name: "Restaurante Demo", role: "EMPRESA" },
  })
  const business = await prisma.business.upsert({
    where: { userId: empresa.id },
    update: {},
    create: {
      userId: empresa.id,
      name: "El Rincón del Born",
      type: "RESTAURANTE",
      description: "Restaurante de cocina mediterránea en el corazón de Palma. Terraza con vistas al Born.",
      address: "Carrer del Born 12, Palma de Mallorca",
    },
  })

  // Empresa secundaria (hotel)
  const empresa2 = await prisma.user.upsert({
    where: { email: "hotel@incentivos.com" },
    update: {},
    create: { email: "hotel@incentivos.com", passwordHash: await hash("empresa1234"), name: "Hotel Demo", role: "EMPRESA" },
  })
  const business2 = await prisma.business.upsert({
    where: { userId: empresa2.id },
    update: {},
    create: {
      userId: empresa2.id,
      name: "Hotel Boutique Palma",
      type: "HOTEL",
      description: "Hotel boutique de 4 estrellas en el centro histórico de Palma.",
      address: "Carrer de Jaume II, 8, Palma",
    },
  })
  console.log("✅ Empresas:", business.name, "+", business2.name)

  // ── CAPTADORES ────────────────────────────────────────────────────────────
  const captador1 = await prisma.user.upsert({
    where: { email: "carlos@incentivos.com" },
    update: {},
    create: { email: "carlos@incentivos.com", passwordHash: await hash("captador1234"), name: "Carlos Martínez", role: "CAPTADOR", phone: "+34600123456" },
  })
  const wallet1 = await prisma.wallet.upsert({ where: { userId: captador1.id }, update: {}, create: { userId: captador1.id, balance: 0 } })

  const captador2 = await prisma.user.upsert({
    where: { email: "ana@incentivos.com" },
    update: {},
    create: { email: "ana@incentivos.com", passwordHash: await hash("captador1234"), name: "Ana Rodríguez", role: "CAPTADOR", phone: "+34611234567" },
  })
  const wallet2 = await prisma.wallet.upsert({ where: { userId: captador2.id }, update: {}, create: { userId: captador2.id, balance: 0 } })

  const captador3 = await prisma.user.upsert({
    where: { email: "miguel@incentivos.com" },
    update: {},
    create: { email: "miguel@incentivos.com", passwordHash: await hash("captador1234"), name: "Miguel Torres", role: "CAPTADOR", phone: "+34622345678" },
  })
  const wallet3 = await prisma.wallet.upsert({ where: { userId: captador3.id }, update: {}, create: { userId: captador3.id, balance: 0 } })

  console.log("✅ Captadores: Carlos, Ana, Miguel")

  // ── STAFF ──────────────────────────────────────────────────────────────────
  const staff = await prisma.user.upsert({
    where: { email: "staff@incentivos.com" },
    update: {},
    create: { email: "staff@incentivos.com", passwordHash: await hash("staff1234"), name: "María García", role: "STAFF" },
  })

  // BusinessStaff con PIN para el restaurante
  const existingBS = await prisma.businessStaff.findFirst({ where: { businessId: business.id, email: staff.email } })
  const businessStaff = existingBS ?? await prisma.businessStaff.create({
    data: { businessId: business.id, email: staff.email, name: "María García", pin: "1234" },
  })
  console.log("✅ Staff: María García (PIN: 1234)")

  // ── CAMPAIGNS ──────────────────────────────────────────────────────────────
  const camp1 = await prisma.campaign.upsert({
    where: { id: "demo-campaign-1" },
    update: {},
    create: {
      id: "demo-campaign-1",
      businessId: business.id,
      title: "Mesa para Dos – Terraza Verano",
      description: "Trae clientes a nuestra terraza y gana 15€ por cada reserva confirmada. Sin límite de reservas.",
      incentiveTypes: ["FIXED"],
      incentiveValue: 15,
      fixedValue: 15,
      status: "ACTIVE",
      startDate: new Date("2026-06-01"),
      endDate: new Date("2026-09-30"),
      maxReservations: 200,
    },
  })

  const camp2 = await prisma.campaign.upsert({
    where: { id: "demo-campaign-2" },
    update: {},
    create: {
      id: "demo-campaign-2",
      businessId: business.id,
      title: "Menú Degustación",
      description: "Refiere clientes para nuestro menú degustación de verano. Gana el 10% del valor de la reserva.",
      incentiveTypes: ["PERCENTAGE"],
      incentiveValue: 10,
      percentageValue: 10,
      status: "ACTIVE",
      startDate: new Date("2026-05-01"),
      endDate: new Date("2026-08-31"),
    },
  })

  const camp3 = await prisma.campaign.upsert({
    where: { id: "demo-campaign-3" },
    update: {},
    create: {
      id: "demo-campaign-3",
      businessId: business2.id,
      title: "Noche de Hotel – Precio Especial",
      description: "Refiere clientes para una noche en nuestro hotel boutique. Recibirás 20€ por reserva.",
      incentiveTypes: ["FIXED", "BONO"],
      incentiveValue: 20,
      fixedValue: 20,
      bonusDescription: "1 noche gratis para ti",
      bonusMinValue: 40,
      status: "ACTIVE",
      startDate: new Date("2026-06-01"),
    },
  })
  console.log("✅ Campañas: 3 activas")

  // ── RESERVATIONS + TRANSACTIONS ────────────────────────────────────────────
  // Build realistic history: 28 reservations, mostly CONFIRMED this month
  // to make landing page stats look impressive

  const clients = [
    { name: "Laura Sánchez", email: "laura.s@gmail.com", phone: "+34651111111" },
    { name: "Pedro Ruiz", email: "pedro.r@hotmail.com", phone: "+34652222222" },
    { name: "Carmen López", email: "carmen.l@gmail.com", phone: "+34653333333" },
    { name: "Antonio García", email: "antonio.g@yahoo.com", phone: "+34654444444" },
    { name: "Isabel Fernández", email: "isabel.f@gmail.com", phone: "+34655555555" },
    { name: "Javier Moreno", email: "javier.m@gmail.com", phone: "+34656666666" },
    { name: "Sofía Torres", email: "sofia.t@hotmail.com", phone: "+34657777777" },
    { name: "David Jiménez", email: "david.j@gmail.com", phone: "+34658888888" },
    { name: "Patricia Díaz", email: "patricia.d@gmail.com", phone: "+34659999999" },
    { name: "Roberto Álvarez", email: "roberto.a@gmail.com", phone: "+34660000000" },
  ]

  type ResSpec = {
    captador: typeof captador1
    wallet: typeof wallet1
    campaign: typeof camp1
    client: (typeof clients)[0]
    date: string
    time: string
    guests: number
    status: "CONFIRMED" | "PENDING" | "CANCELLED"
    createdAt: Date
    incentiveAmount: number
  }

  const reservationSpecs: ResSpec[] = [
    // Last 7 days — CONFIRMED (paidThisWeek stats)
    { captador: captador1, wallet: wallet1, campaign: camp1, client: clients[0], date: "2026-06-15", time: "14:00", guests: 2, status: "CONFIRMED", createdAt: daysAgo(4), incentiveAmount: 15 },
    { captador: captador1, wallet: wallet1, campaign: camp1, client: clients[1], date: "2026-06-16", time: "21:00", guests: 4, status: "CONFIRMED", createdAt: daysAgo(3), incentiveAmount: 15 },
    { captador: captador2, wallet: wallet2, campaign: camp1, client: clients[2], date: "2026-06-17", time: "13:30", guests: 2, status: "CONFIRMED", createdAt: daysAgo(2), incentiveAmount: 15 },
    { captador: captador2, wallet: wallet2, campaign: camp1, client: clients[3], date: "2026-06-18", time: "20:00", guests: 6, status: "CONFIRMED", createdAt: daysAgo(1), incentiveAmount: 15 },
    { captador: captador3, wallet: wallet3, campaign: camp1, client: clients[4], date: "2026-06-19", time: "14:30", guests: 2, status: "CONFIRMED", createdAt: hoursAgo(5), incentiveAmount: 15 },
    { captador: captador1, wallet: wallet1, campaign: camp2, client: clients[5], date: "2026-06-17", time: "21:30", guests: 3, status: "CONFIRMED", createdAt: daysAgo(2), incentiveAmount: 12 },
    { captador: captador3, wallet: wallet3, campaign: camp3, client: clients[6], date: "2026-06-16", time: "15:00", guests: 2, status: "CONFIRMED", createdAt: daysAgo(3), incentiveAmount: 20 },
    { captador: captador2, wallet: wallet2, campaign: camp3, client: clients[7], date: "2026-06-18", time: "12:00", guests: 1, status: "CONFIRMED", createdAt: daysAgo(1), incentiveAmount: 20 },

    // Earlier this month — CONFIRMED
    { captador: captador1, wallet: wallet1, campaign: camp1, client: clients[8], date: "2026-06-05", time: "14:00", guests: 2, status: "CONFIRMED", createdAt: daysAgo(14), incentiveAmount: 15 },
    { captador: captador2, wallet: wallet2, campaign: camp1, client: clients[9], date: "2026-06-06", time: "21:00", guests: 3, status: "CONFIRMED", createdAt: daysAgo(13), incentiveAmount: 15 },
    { captador: captador3, wallet: wallet3, campaign: camp1, client: clients[0], date: "2026-06-07", time: "13:00", guests: 4, status: "CONFIRMED", createdAt: daysAgo(12), incentiveAmount: 15 },
    { captador: captador1, wallet: wallet1, campaign: camp2, client: clients[1], date: "2026-06-08", time: "20:30", guests: 2, status: "CONFIRMED", createdAt: daysAgo(11), incentiveAmount: 12 },
    { captador: captador2, wallet: wallet2, campaign: camp1, client: clients[2], date: "2026-06-10", time: "14:00", guests: 5, status: "CONFIRMED", createdAt: daysAgo(9), incentiveAmount: 15 },
    { captador: captador3, wallet: wallet3, campaign: camp3, client: clients[3], date: "2026-06-11", time: "11:00", guests: 2, status: "CONFIRMED", createdAt: daysAgo(8), incentiveAmount: 20 },
    { captador: captador1, wallet: wallet1, campaign: camp1, client: clients[4], date: "2026-06-12", time: "21:00", guests: 2, status: "CONFIRMED", createdAt: daysAgo(7), incentiveAmount: 15 },
    { captador: captador2, wallet: wallet2, campaign: camp2, client: clients[5], date: "2026-06-13", time: "13:30", guests: 4, status: "CONFIRMED", createdAt: daysAgo(6), incentiveAmount: 12 },
    { captador: captador3, wallet: wallet3, campaign: camp1, client: clients[6], date: "2026-06-14", time: "20:00", guests: 2, status: "CONFIRMED", createdAt: daysAgo(5), incentiveAmount: 15 },
    { captador: captador1, wallet: wallet1, campaign: camp3, client: clients[7], date: "2026-06-14", time: "15:00", guests: 3, status: "CONFIRMED", createdAt: daysAgo(5), incentiveAmount: 20 },

    // PENDING (active, not yet validated)
    { captador: captador2, wallet: wallet2, campaign: camp1, client: clients[8], date: "2026-06-22", time: "14:00", guests: 2, status: "PENDING", createdAt: hoursAgo(2), incentiveAmount: 15 },
    { captador: captador3, wallet: wallet3, campaign: camp1, client: clients[9], date: "2026-06-23", time: "21:00", guests: 4, status: "PENDING", createdAt: hoursAgo(3), incentiveAmount: 15 },
    { captador: captador1, wallet: wallet1, campaign: camp2, client: clients[0], date: "2026-06-24", time: "13:00", guests: 2, status: "PENDING", createdAt: hoursAgo(6), incentiveAmount: 12 },
    { captador: captador2, wallet: wallet2, campaign: camp3, client: clients[1], date: "2026-06-25", time: "20:00", guests: 1, status: "PENDING", createdAt: daysAgo(1), incentiveAmount: 20 },
    { captador: captador3, wallet: wallet3, campaign: camp1, client: clients[2], date: "2026-06-26", time: "14:30", guests: 3, status: "PENDING", createdAt: daysAgo(1), incentiveAmount: 15 },

    // CANCELLED
    { captador: captador1, wallet: wallet1, campaign: camp1, client: clients[3], date: "2026-06-08", time: "14:00", guests: 2, status: "CANCELLED", createdAt: daysAgo(13), incentiveAmount: 0 },
    { captador: captador2, wallet: wallet2, campaign: camp2, client: clients[4], date: "2026-06-03", time: "21:00", guests: 4, status: "CANCELLED", createdAt: daysAgo(18), incentiveAmount: 0 },
    { captador: captador3, wallet: wallet3, campaign: camp1, client: clients[5], date: "2026-06-10", time: "13:00", guests: 2, status: "CANCELLED", createdAt: daysAgo(10), incentiveAmount: 0 },
  ]

  // Accumulators for wallet balances
  let balance1 = 0, balance2 = 0, balance3 = 0

  for (const spec of reservationSpecs) {
    const existing = await prisma.reservation.findFirst({
      where: { campaignId: spec.campaign.id, captadorId: spec.captador.id, clientEmail: spec.client.email },
    })
    if (existing) continue

    const reservation = await prisma.reservation.create({
      data: {
        campaignId: spec.campaign.id,
        captadorId: spec.captador.id,
        clientName: spec.client.name,
        clientEmail: spec.client.email,
        clientPhone: spec.client.phone,
        date: new Date(spec.date),
        time: spec.time,
        guests: spec.guests,
        status: spec.status,
        qrToken: `demo-${Math.random().toString(36).slice(2, 10)}`,
        incentivePaid: spec.status === "CONFIRMED",
        qrScannedAt: spec.status === "CONFIRMED" ? new Date(spec.createdAt.getTime() + 3 * 3600_000) : null,
        createdAt: spec.createdAt,
        chosenIncentiveType: spec.campaign.incentiveTypes[0],
      },
    })

    if (spec.status === "CONFIRMED" && spec.incentiveAmount > 0) {
      const walletId = spec.wallet.id
      await prisma.transaction.create({
        data: {
          walletId,
          amount: spec.incentiveAmount,
          type: "CREDIT",
          description: `Incentivo: ${spec.campaign.title}`,
          reservationId: reservation.id,
          createdAt: new Date(spec.createdAt.getTime() + 3 * 3600_000),
        },
      })
      if (spec.captador.id === captador1.id) balance1 += spec.incentiveAmount
      else if (spec.captador.id === captador2.id) balance2 += spec.incentiveAmount
      else balance3 += spec.incentiveAmount
    }
  }

  // Add a withdrawal for captador1 (shows they actively use the platform)
  const debitAmount = 45
  if (balance1 >= debitAmount) {
    await prisma.transaction.create({
      data: {
        walletId: wallet1.id,
        amount: debitAmount,
        type: "DEBIT",
        description: "Transferencia bancaria",
        createdAt: daysAgo(6),
      },
    })
    balance1 -= debitAmount
  }

  // Update wallet balances
  await prisma.wallet.update({ where: { id: wallet1.id }, data: { balance: Math.max(0, balance1) } })
  await prisma.wallet.update({ where: { id: wallet2.id }, data: { balance: Math.max(0, balance2) } })
  await prisma.wallet.update({ where: { id: wallet3.id }, data: { balance: Math.max(0, balance3) } })

  console.log("✅ Reservas y transacciones creadas")
  console.log(`   Carlos: ${balance1.toFixed(2)}€  |  Ana: ${balance2.toFixed(2)}€  |  Miguel: ${balance3.toFixed(2)}€`)

  // ── STAFF SCAN RECORDS (for confirmed reservations) ────────────────────────
  const confirmedReservations = await prisma.reservation.findMany({
    where: { status: "CONFIRMED", staffScan: null },
    take: 18,
  })
  for (const r of confirmedReservations) {
    await prisma.staffScan.create({
      data: {
        reservationId: r.id,
        businessStaffId: businessStaff.id,
        scannedAt: r.qrScannedAt ?? r.createdAt,
      },
    }).catch(() => null) // ignore if already exists (unique constraint)
  }
  console.log(`✅ ${confirmedReservations.length} staff scans creados`)

  console.log("\n🎉 Seed completado!\n")
  console.log("Credenciales de prueba:")
  console.log("  Admin:    admin@incentivos.com          / admin1234")
  console.log("  Empresa:  empresa@incentivos.com        / empresa1234")
  console.log("  Hotel:    hotel@incentivos.com          / empresa1234")
  console.log("  Carlos:   carlos@incentivos.com         / captador1234")
  console.log("  Ana:      ana@incentivos.com            / captador1234")
  console.log("  Miguel:   miguel@incentivos.com         / captador1234")
  console.log("  Staff:    staff@incentivos.com          / staff1234  (PIN: 1234)")
  console.log("\nStats esperadas en el landing:")
  console.log("  · Confirmadas este mes: ~18")
  console.log("  · Captadores activos:   3")
  console.log("  · Tasa de conversión:   ~72%")
  console.log("  · Pagado esta semana:   ~127€")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
