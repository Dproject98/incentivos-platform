import Stripe from "stripe"
import { isPlaceholder, devLog } from "./dev-mode"

// Lazy initialization — avoids crashing build when STRIPE_SECRET_KEY is missing.
function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    apiVersion: "2024-06-20" as any,
  })
}

function stripeConfigured() {
  return !isPlaceholder(process.env.STRIPE_SECRET_KEY)
}

export async function createConnectedAccount(email: string) {
  if (!stripeConfigured()) {
    devLog("stripe", "STRIPE_SECRET_KEY es un placeholder — devolviendo cuenta simulada", { email })
    return { id: `acct_local_dev_${Date.now()}` } as Stripe.Account
  }
  const stripe = getStripe()
  return stripe.accounts.create({
    type: "express",
    email,
    capabilities: {
      transfers: { requested: true },
    },
  })
}

export async function createAccountLink(accountId: string) {
  if (!stripeConfigured()) {
    devLog("stripe", "STRIPE_SECRET_KEY es un placeholder — saltando el onboarding real de Stripe", { accountId })
    // Redirige directo al "success" que la app ya espera tras volver de Stripe,
    // para poder probar el resto del flujo de wallet sin salir a stripe.com.
    return { url: `${process.env.NEXT_PUBLIC_APP_URL}/es/captador/wallet?stripe=success&dev_mock=1` } as Stripe.AccountLink
  }
  const stripe = getStripe()
  return stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/es/captador/wallet`,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/es/captador/wallet?stripe=success`,
    type: "account_onboarding",
  })
}

export async function createPayout(
  amount: number,
  stripeAccountId: string,
  description: string
) {
  if (!stripeConfigured()) {
    devLog("stripe", "STRIPE_SECRET_KEY es un placeholder — simulando payout sin llamar a Stripe", { amount, stripeAccountId, description })
    return { id: `tr_local_dev_${Date.now()}`, amount: Math.round(amount * 100), currency: "eur" } as Stripe.Transfer
  }
  const stripe = getStripe()
  return stripe.transfers.create({
    amount: Math.round(amount * 100),
    currency: "eur",
    destination: stripeAccountId,
    description,
  })
}
