// Detecta si una clave de servicio externo (Resend/Twilio/Stripe) sigue
// siendo el valor placeholder de env.production.example o esta vacia, para
// que el entorno local pueda ejercitar los flujos que dependen de ella sin
// necesitar credenciales reales ni red hacia fuera.
//
// Solo aplica en local: si algun dia hay una clave real puesta, isPlaceholder
// devuelve false y el codigo llama al servicio de verdad como siempre.
export function isPlaceholder(value: string | undefined): boolean {
  if (!value) return true
  return value.includes("xxxxxxxxxxxx")
}

export function devLog(scope: string, message: string, data?: unknown) {
  console.log(`[dev-mode:${scope}] ${message}`, data ?? "")
}
