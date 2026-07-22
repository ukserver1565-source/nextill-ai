import type {
  PaymentVerificationAdapter,
  PaymentVerificationParams,
  PaymentVerificationResult,
} from './types'

/**
 * Stripe Payment Verification Adapter
 *
 * Verifies payments by querying the Stripe API directly via fetch.
 * Requires STRIPE_SECRET_KEY environment variable (sk_live_... or sk_test_...).
 *
 * Verification strategy:
 *   1. Attempt to retrieve the transaction as a PaymentIntent.
 *   2. If that fails, attempt to retrieve it as a Charge.
 *   3. Confirm the status is "succeeded" and the captured amount matches.
 */

const STRIPE_API_BASE = 'https://api.stripe.com/v1'

function getSecretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not set')
  }
  return key
}

/**
 * Convert a display amount (e.g. 29.99) to Stripe's smallest-currency-unit format
 * using the currency's default decimal places (most are 2, JPY/JPYC/KWD/BHD are 0).
 */
function toStripeAmount(amount: number, currency: string): number {
  const zeroDecimal = ['JPY', 'JPYC', 'KWD', 'BHD', 'OMR'].includes(
    currency.toUpperCase()
  )
  return zeroDecimal ? Math.round(amount) : Math.round(amount * 100)
}

async function stripeGet(path: string): Promise<unknown> {
  const secretKey = getSecretKey()
  const response = await fetch(`${STRIPE_API_BASE}${path}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(
      `Stripe API error ${response.status}: ${body}`
    )
  }

  return response.json()
}

export const stripeAdapter: PaymentVerificationAdapter = {
  async verifyPayment(
    params: PaymentVerificationParams
  ): Promise<PaymentVerificationResult> {
    const { transactionId, amount, currency } = params

    // --- Attempt 1: Retrieve as a PaymentIntent ---
    try {
      const pi = (await stripeGet(
        `/payment_intents/${encodeURIComponent(transactionId)}`
      )) as Record<string, unknown>

      const status = pi.status as string
      const piAmount = pi.amount as number
      const piCurrency = (pi.currency as string).toUpperCase()

      if (status !== 'succeeded') {
        return {
          success: false,
          message: `PaymentIntent status is "${status}" (expected "succeeded")`,
          rawResponse: pi,
        }
      }

      if (piCurrency !== currency.toUpperCase()) {
        return {
          success: false,
          message: `Currency mismatch: payment is ${piCurrency} but expected ${currency.toUpperCase()}`,
          rawResponse: pi,
        }
      }

      const expectedAmount = toStripeAmount(amount, currency)
      if (piAmount !== expectedAmount) {
        return {
          success: false,
          message: `Amount mismatch: payment is ${piAmount} (smallest unit) but expected ${expectedAmount}`,
          rawResponse: pi,
        }
      }

      return {
        success: true,
        message: `PaymentIntent ${transactionId} verified successfully (amount: ${amount} ${currency.toUpperCase()})`,
        rawResponse: pi,
      }
    } catch (_piError) {
      // PaymentIntent not found — fall through to try Charge
    }

    // --- Attempt 2: Retrieve as a Charge ---
    try {
      const charge = (await stripeGet(
        `/charges/${encodeURIComponent(transactionId)}`
      )) as Record<string, unknown>

      const status = charge.status as string
      const chargeAmount = charge.amount as number
      const chargeCurrency = (charge.currency as string).toUpperCase()

      if (status !== 'succeeded') {
        return {
          success: false,
          message: `Charge status is "${status}" (expected "succeeded")`,
          rawResponse: charge,
        }
      }

      if (chargeCurrency !== currency.toUpperCase()) {
        return {
          success: false,
          message: `Currency mismatch: charge is ${chargeCurrency} but expected ${currency.toUpperCase()}`,
          rawResponse: charge,
        }
      }

      const expectedAmount = toStripeAmount(amount, currency)
      if (chargeAmount !== expectedAmount) {
        return {
          success: false,
          message: `Amount mismatch: charge is ${chargeAmount} (smallest unit) but expected ${expectedAmount}`,
          rawResponse: charge,
        }
      }

      return {
        success: true,
        message: `Charge ${transactionId} verified successfully (amount: ${amount} ${currency.toUpperCase()})`,
        rawResponse: charge,
      }
    } catch (chargeError) {
      return {
        success: false,
        message: `Could not retrieve transaction ${transactionId} as PaymentIntent or Charge: ${(chargeError as Error).message}`,
      }
    }
  },

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      // Hitting /v1/account validates the secret key without side effects.
      const account = (await stripeGet('/account')) as Record<string, unknown>
      return {
        success: true,
        message: `Connected to Stripe account "${account.id}" (${account.email ?? 'no email'})`,
      }
    } catch (error) {
      return {
        success: false,
        message: `Stripe connection failed: ${(error as Error).message}`,
      }
    }
  },
}
