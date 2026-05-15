import twilio from "twilio"

// Lazy initialization — instantiated at call time, not module load time.
function getTwilioClient() {
  return twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  )
}

interface ReservationWhatsAppData {
  clientName: string
  clientPhone: string
  businessName: string
  date: string
  time: string
  guests: number
  qrToken: string
  language?: string
}

export async function sendReservationWhatsApp(data: ReservationWhatsAppData) {
  const scanUrl = `${process.env.NEXT_PUBLIC_APP_URL}/scan/${data.qrToken}`
  const isEs = data.language !== "en"

  const body = isEs
    ? `¡Hola ${data.clientName}! 🎉\n\nTu reserva en *${data.businessName}* ha sido confirmada:\n\n📅 Fecha: ${data.date}\n🕐 Hora: ${data.time}\n👥 Personas: ${data.guests}\n\nMuestra este enlace QR al llegar:\n${scanUrl}\n\n_Plataforma de Incentivos_`
    : `Hello ${data.clientName}! 🎉\n\nYour reservation at *${data.businessName}* is confirmed:\n\n📅 Date: ${data.date}\n🕐 Time: ${data.time}\n👥 Guests: ${data.guests}\n\nShow this QR link when you arrive:\n${scanUrl}\n\n_Incentives Platform_`

  const phone = data.clientPhone.startsWith("+")
    ? data.clientPhone
    : `+${data.clientPhone}`

  const client = getTwilioClient()
  await client.messages.create({
    body,
    from: process.env.TWILIO_WHATSAPP_FROM,
    to: `whatsapp:${phone}`,
  })
}
