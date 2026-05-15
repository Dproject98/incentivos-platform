import Stripe from "stripe"

// Lazy initialization — avoids crashing build when STRIPE_SECRET_KEY is missing.
function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    apiVersion: "2024-06-20" as any,
  })
}

export async function createConnectedAccount(email: string) {
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
  const stripe = getStripe()
  return stripe.transfers.create({
    amount: Math.round(amount * 100),
    currency: "eur",
    destination: stripeAccountId,
    description,
  })
}
