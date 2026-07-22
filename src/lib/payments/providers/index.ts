import type { PaymentVerificationAdapter } from './types'
import { stripeAdapter } from './stripe.adapter'
import { paypalAdapter } from './paypal.adapter'
import { jazzcashAdapter } from './jazzcash.adapter'
import { easypaisaAdapter } from './easypaisa.adapter'
import { payoneerAdapter } from './payoneer.adapter'
import { bankTransferAdapter } from './bank_transfer.adapter'
import { cryptoAdapter } from './crypto.adapter'

/**
 * Registry of all payment verification adapters.
 *
 * Each adapter implements the PaymentVerificationAdapter interface and is
 * keyed by the provider slug used throughout the application.
 *
 * Provider statuses:
 *   - stripe:    LIVE    — full verification via Stripe API
 *   - paypal:    LIVE    — full verification via PayPal Orders API
 *   - jazzcash:  STUB    — requires Pakistani merchant credentials
 *   - easypaisa: STUB    — requires Pakistani merchant credentials
 *   - payoneer:  STUB    — requires enterprise partnership
 *   - bank_transfer: MANUAL — always requires admin approval
 *   - crypto:    MANUAL — always requires admin approval
 */
export const adapters: Record<string, PaymentVerificationAdapter> = {
  stripe: stripeAdapter,
  paypal: paypalAdapter,
  jazzcash: jazzcashAdapter,
  easypaisa: easypaisaAdapter,
  payoneer: payoneerAdapter,
  bank_transfer: bankTransferAdapter,
  crypto: cryptoAdapter,
}

/**
 * Get the verification adapter for a given payment provider.
 * Returns null if no adapter exists for the provider.
 */
export function getAdapter(provider: string): PaymentVerificationAdapter | null {
  return adapters[provider] || null
}

export type {
  PaymentVerificationParams,
  PaymentVerificationResult,
  PaymentVerificationAdapter,
} from './types'
