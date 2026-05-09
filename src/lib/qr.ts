import QRCode from "qrcode"

export async function generateQRDataURL(token: string): Promise<string> {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/scan/${token}`
  return QRCode.toDataURL(url, {
    width: 400,
    margin: 2,
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
