import type {
  PaymentVerificationAdapter,
  PaymentVerificationParams,
  PaymentVerificationResult,
} from './types'

/**
 * JazzCash Payment Verification Adapter (STUB)
 *
 * JazzCash provides a Merchant Transaction Inquiry API for payment verification.
 * The real implementation would:
 *
 *   1. Build a payload with these fields:
 *      - MerchantID       — assigned by JazzCash
 *      - Password          — merchant portal password
 *      - ReturnURL         — callback URL
 *      - Ammount            — amount in PKR (note: JazzCash uses "Ammount" typo)
 *      - TxnRequestDateTime — ISO 8601 timestamp
 *      - SignecureHashCode  — HMAC-SHA256 hash of the payload (note: JazzCash spelling)
 *
 *   2. POST to the merchant portal:
 *      - Sandbox: https://sandbox.jazzcash.com.pk/ApplicationAPI/API/Inquiry
 *      - Production: https://www.jazzcash.com.pk/ApplicationAPI/API/Inquiry
 *
 *   3. The encrypted payload uses a specific format with pipe-separated values
 *      and an AES-128-ECB encrypted signature block.
 *
 * However, JazzCash requires a Pakistani merchant account and their API is not
 * publicly testable outside of their partner program. Until a merchant account
 * is provisioned, verification runs in manual mode.
 *
 * To activate: set JAZZCASH_MERCHANT_ID and JAZZCASH_PASSWORD, then implement
 * the AES encryption and POST logic described above.
 */

const JAZZCASH_SANDBOX_URL = 'https://sandbox.jazzcash.com.pk/ApplicationAPI/API/Inquiry'
const JAZZCASH_PRODUCTION_URL = 'https://www.jazzcash.com.pk/ApplicationAPI/API/Inquiry'

function isConfigured(): boolean {
  return Boolean(
    process.env.JAZZCASH_MERCHANT_ID && process.env.JAZZCASH_PASSWORD
  )
}

export const jazzcashAdapter: PaymentVerificationAdapter = {
  async verifyPayment(
    _params: PaymentVerificationParams
  ): Promise<PaymentVerificationResult> {
    if (!isConfigured()) {
      return {
        success: false,
        message:
          'JazzCash auto-verification requires merchant credentials setup. ' +
          'Set JAZZCASH_MERCHANT_ID and JAZZCASH_PASSWORD to enable. ' +
          'Until then, payments must be manually approved in the admin panel.',
      }
    }

    // When credentials are available, the real flow would be:
    //
    // 1. Build the inquiry payload:
    //    {
    //      MerchantID: process.env.JAZZCASH_MERCHANT_ID,
    //      Password: process.env.JAZZCASH_PASSWORD,
    //      Ammount: params.amount,
    //      TxnRequestDateTime: new Date().toISOString(),
    //      // ... other required fields
    //    }
    //
    // 2. Create the SignecureHashCode:
    //    - Sort all fields alphabetically by key
    //    - Concatenate values with "&" separator
    //    - Compute HMAC-SHA256 with the merchant password
    //
    // 3. Encrypt the payload using AES-128-ECB with JazzCash's encryption key
    //
    // 4. POST to the inquiry endpoint:
    //    const url = process.env.JAZZCASH_SANDBOX === 'true'
    //      ? JAZZCASH_SANDBOX_URL
    //      : JAZZCASH_PRODUCTION_URL
    //
    // 5. Parse the encrypted response and check TransactionStatus == "0000" (success)

    return {
      success: false,
      message:
        'JazzCash verification logic is not yet implemented. ' +
        'Payments require manual admin approval.',
    }
  },

  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!isConfigured()) {
      return {
        success: false,
        message:
          'JazzCash sandbox not available - use manual mode. ' +
          'JazzCash does not provide a public sandbox for API testing. ' +
          'A valid Pakistani merchant account is required.',
      }
    }

    return {
      success: false,
      message:
        'JazzCash API connectivity test not implemented. ' +
        'Merchant credentials are configured but the verification flow needs to be built.',
    }
  },
}
