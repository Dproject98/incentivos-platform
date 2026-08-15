import { Resend } from "resend"
import { generateQRDataURL } from "./qr"

// Lazy initialization — instantiated at call time, not module load time,
// so missing env vars don't crash the build during page data collection.
function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

interface ReservationEmailData {
  clientName: string
  clientEmail: string
  businessName: string
  date: string
  time: string
  guests: number
  qrToken: string
  language?: string
}

export async function sendReservationEmail(data: ReservationEmailData) {
  const qrDataUrl = await generateQRDataURL(data.qrToken)
  const qrBase64 = qrDataUrl.replace("data:image/png;base64,", "")
  const scanUrl = `${process.env.NEXT_PUBLIC_APP_URL}/scan/${data.qrToken}`

  const isEs = data.language !== "en"

  const subject = isEs
    ? `Tu reserva en ${data.businessName} - Código QR`
    : `Your reservation at ${data.businessName} - QR Code`

  const html = isEs
    ? `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #1a1a1a;">¡Hola ${data.clientName}!</h2>
      <p>Tu reserva ha sido confirmada. Muestra este código QR al llegar al establecimiento.</p>
      <div style="background: #f9f9f9; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
        <p style="font-weight: bold; font-size: 18px; margin-bottom: 8px;">${data.businessName}</p>
        <p>📅 ${data.date} &nbsp;|&nbsp; 🕐 ${data.time} &nbsp;|&nbsp; 👥 ${data.guests} personas</p>
        <img src="cid:qrcode" alt="Código QR" style="width: 250px; margin: 16px auto; display: block;" />
        <p style="color: #666; font-size: 13px;">También puedes ver tu QR en: <a href="${scanUrl}">${scanUrl}</a></p>
      </div>
      <p style="color: #888; font-size: 12px;">Si tienes alguna pregunta, contacta directamente con el establecimiento.</p>
    </div>
  `
    : `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #1a1a1a;">Hello ${data.clientName}!</h2>
      <p>Your reservation has been confirmed. Show this QR code when you arrive at the venue.</p>
      <div style="background: #f9f9f9; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
        <p style="font-weight: bold; font-size: 18px; margin-bottom: 8px;">${data.businessName}</p>
        <p>📅 ${data.date} &nbsp;|&nbsp; 🕐 ${data.time} &nbsp;|&nbsp; 👥 ${data.guests} guests</p>
        <img src="cid:qrcode" alt="QR Code" style="width: 250px; margin: 16px auto; display: block;" />
        <p style="color: #666; font-size: 13px;">You can also view your QR at: <a href="${scanUrl}">${scanUrl}</a></p>
      </div>
      <p style="color: #888; font-size: 12px;">If you have any questions, please contact the venue directly.</p>
    </div>
  `

  const resend = getResend()
  await resend.emails.send({
    from: "Incentivos Platform <reservas@incentivos.app>",
    to: data.clientEmail,
    subject,
    html,
    attachments: [
      {
        filename: "reserva-qr.png",
        content: qrBase64,
        contentType: "image/png",
      },
    ],
  })
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #0F1F1A; font-size: 22px; margin-bottom: 8px;">Restablecer contraseña</h2>
      <p style="color: #4a5568; margin-bottom: 24px;">
        Has solicitado restablecer tu contraseña en Incentivos Platform.
        Haz clic en el botón siguiente para crear una nueva contraseña.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetUrl}"
          style="background: #1F6B4D; color: #F2EBDC; padding: 14px 32px; border-radius: 999px;
                 text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block;">
          Restablecer contraseña
        </a>
      </div>
      <p style="color: #718096; font-size: 13px; margin-top: 24px;">
        Este enlace expira en <strong>1 hora</strong>. Si no has solicitado este cambio,
        ignora este email y tu contraseña no cambiará.
      </p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="color: #a0aec0; font-size: 12px;">
        Si el botón no funciona, copia este enlace en tu navegador:<br/>
        <a href="${resetUrl}" style="color: #1F6B4D;">${resetUrl}</a>
      </p>
    </div>
  `

  const resend = getResend()
  await resend.emails.send({
    from: "Incentivos Platform <noreply@incentivos.app>",
    to: email,
    subject: "Restablece tu contraseña — Incentivos Platform",
    html,
  })
}
