import type {
  PaymentVerificationAdapter,
  PaymentVerificationParams,
  PaymentVerificationResult,
} from './types'

/**
 * GoFastPay Payment Verification Adapter (STUB)
 *
 * GoFastPay provides a transaction verification API for payment gateways.
 * The real implementation would:
 *
 *   1. Build a request payload with these fields:
 *      - merchant_id  — assigned by GoFastPay
 *      - api_key      — merchant API key for authentication
 *      - transaction_id — the payment reference / transaction ID to verify
 *      - amount       — expected payment amount
 *      - currency     — currency code (e.g. USD, PKR)
 *      - timestamp    — ISO 8601 request timestamp
 *      - signature    — HMAC-SHA256 hash of the payload for integrity
 *
 *   2. POST to the verification endpoint:
 *      - Sandbox: https://sandbox.gofastpay.com/api/v1/transaction/verify
 *      - Production: https://api.gofastpay.com/api/v1/transaction/verify
 *
 *   3. The response includes:
 *      - status: "success" | "failed" | "pending"
 *      - transaction_id
 *      - amount
 *      - currency
 *      - message
 *
 * However, GoFastPay requires a merchant account and their API is not
 * publicly testable outside of their partner program. Until a merchant account
 * is provisioned, verification runs in manual mode.
 *
 * To activate: set GFASTPAY_API_KEY and GFASTPAY_MERCHANT_ID, then implement
 * the signature generation and POST logic described above.
 */

const _GOFASTPAY_SANDBOX_URL = 'https://sandbox.gofastpay.com/api/v1/transaction/verify'
const _GOFASTPAY_PRODUCTION_URL = 'https://api.gofastpay.com/api/v1/transaction/verify'

function isConfigured(): boolean {
  return Boolean(
    process.env.GFASTPAY_API_KEY && process.env.GFASTPAY_MERCHANT_ID
  )
}

/**
 * Build an HMAC-SHA256 signature for the GoFastPay request payload.
 *
 * In production this would:
 *   1. Sort all payload fields alphabetically by key
 *   2. Concatenate values with "&" separator
 *   3. Compute HMAC-SHA256 using the API key as the secret
 *
 * Example:
 *   const crypto = require('crypto')
 *   const sortedValues = Object.keys(payload).sort().map(k => payload[k]).join('&')
 *   const signature = crypto.createHmac('sha256', process.env.GFASTPAY_API_KEY)
 *     .update(sortedValues)
 *     .digest('hex')
 */
function _buildSignature(_payload: Record<string, string>): string {
  // TODO: Implement HMAC-SHA256 signature when GoFastPay merchant account is active
  return ''
}

export const gofastpayAdapter: PaymentVerificationAdapter = {
  async verifyPayment(
    _params: PaymentVerificationParams
  ): Promise<PaymentVerificationResult> {
    if (!isConfigured()) {
      return {
        success: false,
        message:
          'GoFastPay auto-verification requires merchant credentials setup. ' +
          'Set GFASTPAY_API_KEY and GFASTPAY_MERCHANT_ID to enable. ' +
          'Until then, payments must be manually approved in the admin panel.',
      }
    }

    // When credentials are available, the real flow would be:
    //
    // 1. Build the verification payload:
    //    const payload = {
    //      merchant_id: process.env.GFASTPAY_MERCHANT_ID,
    //      api_key: process.env.GFASTPAY_API_KEY,
    //      transaction_id: params.transactionId,
    //      amount: params.amount.toString(),
    //      currency: params.currency.toUpperCase(),
    //      timestamp: new Date().toISOString(),
    //    }
    //
    // 2. Compute the signature:
    //    const signature = buildSignature(payload)
    //    payload.signature = signature
    //
    // 3. POST to the verification endpoint:
    //    const url = process.env.GFASTPAY_SANDBOX === 'true'
    //      ? GOFASTPAY_SANDBOX_URL
    //      : GOFASTPAY_PRODUCTION_URL
    //
    //    const response = await fetch(url, {
    //      method: 'POST',
    //      headers: {
    //        'Content-Type': 'application/json',
    //        'Authorization': `Bearer ${process.env.GFASTPAY_API_KEY}`,
    //      },
    //      body: JSON.stringify(payload),
    //    })
    //
    //    const result = await response.json()
    //
    // 4. Parse the response and verify:
    //    - result.status === "success"
    //    - Number(result.amount) === params.amount
    //    - result.currency === params.currency.toUpperCase()
    //
    // 5. Return:
    //    return {
    //      success: result.status === 'success',
    //      message: result.message || 'Transaction verified',
    //      rawResponse: result,
    //    }

    return {
      success: false,
      message:
        'GoFastPay verification logic is not yet implemented. ' +
        'Payments require manual admin approval.',
    }
  },

  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!isConfigured()) {
      return {
        success: false,
        message:
          'GoFastPay sandbox not available - use manual mode. ' +
          'GoFastPay does not provide a public sandbox for API testing. ' +
          'A valid merchant account is required.',
      }
    }

    // When active, the real test would:
    //
    // 1. POST a ping/health-check to the GoFastPay API:
    //    const url = process.env.GFASTPAY_SANDBOX === 'true'
    //      ? GOFASTPAY_SANDBOX_URL
    //      : GOFASTPAY_PRODUCTION_URL
    //
    //    const response = await fetch(url.replace('/verify', '/ping'), {
    //      method: 'GET',
    //      headers: {
    //        'Authorization': `Bearer ${process.env.GFASTPAY_API_KEY}`,
    //      },
    //    })
    //
    //    if (response.ok) {
    //      return { success: true, message: 'GoFastPay API connection successful' }
    //    }
    //
    //    return { success: false, message: `GoFastPay API error: ${response.statusText}` }

    return {
      success: false,
      message:
        'GoFastPay API connectivity test not implemented. ' +
        'Merchant credentials are configured but the verification flow needs to be built.',
    }
  },
}
