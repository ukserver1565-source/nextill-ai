import type {
  PaymentVerificationAdapter,
  PaymentVerificationParams,
  PaymentVerificationResult,
} from './types'

/**
 * EasyPaisa Payment Verification Adapter (STUB)
 *
 * EasyPaisa (by Telenor/JS Bank) provides a Merchant Payment Inquiry API.
 * The real implementation would:
 *
 *   1. Build an inquiry request with:
 *      - MerchantID       — assigned by EasyPaisa
 *      - Password          — merchant portal password
 *      - TransactionID     — the TPL reference ID from the customer's payment
 *      - Ammount           — expected amount (note: EasyPaisa also uses "Ammount")
 *      - SignecureHashCode — HMAC-SHA256 of the payload
 *
 *   2. POST to the merchant API endpoint:
 *      - Sandbox: https://sandbox-api.easypaisa.com/easypaisa/v1/inquiry
 *      - Production: https://api.easypaisa.com/easypaisa/v1/inquiry
 *
 *   3. The encrypted payload format is similar to JazzCash: pipe-separated values
 *      with AES-128-ECB encrypted signature block.
 *
 * EasyPaisa's sandbox is limited to registered Pakistani merchants and is not
 * publicly accessible. The API structure documented here is based on the
 * EasyPaisa Merchant Integration Guide.
 *
 * To activate: set EASYPAISA_MERCHANT_ID and EASYPAISA_PASSWORD, then implement
 * the encryption and POST logic described above.
 */

const EASYPAISA_SANDBOX_URL = 'https://sandbox-api.easypaisa.com/easypaisa/v1/inquiry'
const EASYPAISA_PRODUCTION_URL = 'https://api.easypaisa.com/easypaisa/v1/inquiry'

function isConfigured(): boolean {
  return Boolean(
    process.env.EASYPAISA_MERCHANT_ID && process.env.EASYPAISA_PASSWORD
  )
}

export const easypaisaAdapter: PaymentVerificationAdapter = {
  async verifyPayment(
    _params: PaymentVerificationParams
  ): Promise<PaymentVerificationResult> {
    if (!isConfigured()) {
      return {
        success: false,
        message:
          'EasyPaisa auto-verification requires merchant credentials setup. ' +
          'Set EASYPAISA_MERCHANT_ID and EASYPAISA_PASSWORD to enable. ' +
          'Until then, payments must be manually approved in the admin panel.',
      }
    }

    // When credentials are available, the real flow would be:
    //
    // 1. Build the inquiry payload:
    //    {
    //      MerchantID: process.env.EASYPAISA_MERCHANT_ID,
    //      Password: process.env.EASYPAISA_PASSWORD,
    //      TransactionID: params.transactionId,
    //      Ammount: params.amount,
    //      // ... other required fields
    //    }
    //
    // 2. Create the SignecureHashCode:
    //    - Sort all fields alphabetically by key
    //    - Concatenate values with "&" separator
    //    - Compute HMAC-SHA256 with the merchant password
    //
    // 3. Encrypt the payload using AES-128-ECB with EasyPaisa's encryption key
    //
    // 4. POST to the inquiry endpoint:
    //    const url = process.env.EASYPAISA_SANDBOX === 'true'
    //      ? EASYPAISA_SANDBOX_URL
    //      : EASYPAISA_PRODUCTION_URL
    //
    // 5. Parse the encrypted response and check TransactionStatus == "0000" (success)

    return {
      success: false,
      message:
        'EasyPaisa verification logic is not yet implemented. ' +
        'Payments require manual admin approval.',
    }
  },

  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!isConfigured()) {
      return {
        success: false,
        message:
          'EasyPaisa sandbox not available - use manual mode. ' +
          'EasyPaisa does not provide a public sandbox for API testing. ' +
          'A valid Pakistani merchant account is required.',
      }
    }

    return {
      success: false,
      message:
        'EasyPaisa API connectivity test not implemented. ' +
        'Merchant credentials are configured but the verification flow needs to be built.',
    }
  },
}
