import { createHmac, timingSafeEqual } from "crypto"

const TOKEN_TTL_MS = 60 * 60 * 1000 // 1 hour

export function createResetToken(email: string): string {
  const secret = process.env.NEXTAUTH_SECRET!
  const payload = Buffer.from(JSON.stringify({ email, exp: Date.now() + TOKEN_TTL_MS })).toString("base64url")
  const sig = createHmac("sha256", secret).update(payload).digest("base64url")
  return `${payload}.${sig}`
}

export function verifyResetToken(token: string): string | null {
  const secret = process.env.NEXTAUTH_SECRET!
  const dot = token.lastIndexOf(".")
  if (dot === -1) return null

  const payload = token.slice(0, dot)
  const sig = token.slice(dot + 1)
  const expectedSig = createHmac("sha256", secret).update(payload).digest("base64url")

  // Constant-time comparison to prevent timing attacks
  try {
    const sigBuf = Buffer.from(sig)
    const expBuf = Buffer.from(expectedSig)
    if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) return null
  } catch {
    return null
  }

  try {
    const { email, exp } = JSON.parse(Buffer.from(payload, "base64url").toString())
    if (Date.now() > exp) return null
    return email as string
  } catch {
    return null
  }
}
