import QRCode from "qrcode"

export async function generateQRDataURL(token: string): Promise<string> {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/scan/${token}`
  return QRCode.toDataURL(url, {
    width: 400,
    margin: 2,
    // Contraste maximo a proposito (blanco puro, no el "ink" de marca):
    // esto es el color de los modulos claros de un QR real que la gente
    // escanea con el movil, no un elemento decorativo — no seguir la paleta.
    color: { dark: "#000000", light: "#ffffff" },
  })
}

export async function generateQRBuffer(token: string): Promise<Buffer> {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/scan/${token}`
  return QRCode.toBuffer(url, {
    width: 400,
    margin: 2,
  })
}
