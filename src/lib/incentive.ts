// Shared incentive calculation. Used by both confirmation paths:
//   - src/app/api/reservations/[id]/confirm/route.ts (empresa confirms from panel)
//   - src/app/api/scan/[token]/route.ts (staff PIN/QR scan)
//
// Returns the cash amount to credit to the captador's wallet based on the
// compensation the captador chose at reservation time.
//   FIXED      → campaign.fixedValue      (€ per reservation)
//   PERCENTAGE → campaign.percentageValue (treated as a flat amount; no ticket total captured)
//   BONO       → 0 (the bono is redeemed separately from the wallet, not credited here)
//
// Falls back to the legacy single `incentiveValue` for campaigns created before
// the per-type value split.

export interface IncentiveCampaign {
  incentiveTypes: string[]
  incentiveValue: number
  fixedValue: number | null
  percentageValue: number | null
}

export function cashIncentiveAmount(
  campaign: IncentiveCampaign,
  chosenType: string | null | undefined
): number {
  const type = chosenType ?? campaign.incentiveTypes[0]
  if (type === "FIXED") return campaign.fixedValue ?? campaign.incentiveValue ?? 0
  if (type === "PERCENTAGE") return campaign.percentageValue ?? campaign.incentiveValue ?? 0
  return 0 // BONO or unknown: no cash credit on confirmation
}
