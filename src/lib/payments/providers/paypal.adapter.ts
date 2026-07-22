import type {
  PaymentVerificationAdapter,
  PaymentVerificationParams,
  PaymentVerificationResult,
} from './types'

/**
 * PayPal Payment Verification Adapter
 *
 * Verifies payments via the PayPal Orders API.
 * Requires PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET environment variables.
 *
 * For live: uses https://api-m.paypal.com
 * For sandbox: uses https://api-m.sandbox.paypal.com (set PAYPAL_SANDBOX=true)
 *
 * Verification strategy:
 *   1. Obtain an OAuth2 bearer token.
 *   2. Retrieve the order by ID.
 *   3. Confirm status is APPROVED or COMPLETED and the purchase_unit amount matches.
 */

function getPayPalBaseUrl(): string {
  return process.env.PAYPAL_SANDBOX === 'true'
    ? 'https://api-m.sandbox.paypal.com'
    : 'https://api-m.paypal.com'
}

function getCredentials(): { clientId: string; clientSecret: string } {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    throw new Error(
      'PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET environment variables are required'
    )
  }
  return { clientId, clientSecret }
}

/**
 * Obtain a PayPal OAuth2 access token using client_credentials grant.
 * Tokens are short-lived (typically ~1 hour) so we fetch a fresh one per request.
 */
async function getAccessToken(): Promise<string> {
  const { clientId, clientSecret } = getCredentials()
  const baseUrl = getPayPalBaseUrl()

  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(
      `PayPal OAuth token request failed (${response.status}): ${body}`
    )
  }

  const data = (await response.json()) as { access_token: string }
  return data.access_token
}

async function paypalGet(path: string): Promise<unknown> {
  const baseUrl = getPayPalBaseUrl()
  const token = await getAccessToken()

  const response = await fetch(`${baseUrl}${path}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(
      `PayPal API error ${response.status}: ${body}`
    )
  }

  return response.json()
}

/**
 * Parse PayPal's amount structure to extract the numeric value.
 * PayPal returns amounts as strings like "29.99".
 */
function parsePayPalAmount(
  purchaseUnits: Array<{
    amount?: { currency_code?: string; value?: string }
  }>
): { amount: number; currency: string } | null {
  if (!purchaseUnits || purchaseUnits.length === 0) return null

  const firstUnit = purchaseUnits[0]
  const amountObj = firstUnit.amount
  if (!amountObj || !amountObj.value || !amountObj.currency_code) return null

  return {
    amount: parseFloat(amountObj.value),
    currency: amountObj.currency_code.toUpperCase(),
  }
}

export const paypalAdapter: PaymentVerificationAdapter = {
  async verifyPayment(
    params: PaymentVerificationParams
  ): Promise<PaymentVerificationResult> {
    const { transactionId, amount, currency } = params

    try {
      // Retrieve the PayPal order
      const order = (await paypalGet(
        `/v2/checkout/orders/${encodeURIComponent(transactionId)}`
      )) as Record<string, unknown>

      const status = order.status as string

      // PayPal order statuses:
      //   CREATED -> APPROVED -> COMPLETED
      //   Both APPROVED and COMPLETED indicate the buyer approved payment.
      const validStatuses = ['APPROVED', 'COMPLETED']
      if (!validStatuses.includes(status)) {
        return {
          success: false,
          message: `PayPal order status is "${status}" (expected APPROVED or COMPLETED)`,
          rawResponse: order,
        }
      }

      // Parse and validate the amount
      const purchaseUnits = order.purchase_units as Array<{
        amount?: { currency_code?: string; value?: string }
      }>
      const parsed = parsePayPalAmount(purchaseUnits)
      if (!parsed) {
        return {
          success: false,
          message: 'Could not parse amount from PayPal order',
          rawResponse: order,
        }
      }

      if (parsed.currency !== currency.toUpperCase()) {
        return {
          success: false,
          message: `Currency mismatch: order is ${parsed.currency} but expected ${currency.toUpperCase()}`,
          rawResponse: order,
        }
      }

      // Compare amounts with a small epsilon for floating-point precision
      const diff = Math.abs(parsed.amount - amount)
      if (diff > 0.01) {
        return {
          success: false,
          message: `Amount mismatch: order is ${parsed.amount} ${parsed.currency} but expected ${amount}`,
          rawResponse: order,
        }
      }

      return {
        success: true,
        message: `PayPal order ${transactionId} verified successfully (${status}, amount: ${amount} ${currency.toUpperCase()})`,
        rawResponse: order,
      }
    } catch (error) {
      return {
        success: false,
        message: `PayPal verification failed: ${(error as Error).message}`,
      }
    }
  },

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      // Attempting to obtain an OAuth token validates the client credentials.
      const token = await getAccessToken()
      return {
        success: true,
        message: `PayPal connection successful (obtained OAuth token: ${token.substring(0, 8)}...)`,
      }
    } catch (error) {
      return {
        success: false,
        message: `PayPal connection failed: ${(error as Error).message}`,
      }
    }
  },
}
