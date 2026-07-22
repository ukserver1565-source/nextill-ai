import type {
  PaymentVerificationAdapter,
  PaymentVerificationParams,
  PaymentVerificationResult,
} from './types'

/**
 * Payoneer Payment Verification Adapter (STUB)
 *
 * Payoneer's payment verification API is restricted to enterprise-level partners
 * through their Mass Payout and Payoneer for Platforms programs. There is no
 * publicly accessible sandbox or self-service API key provisioning.
 *
 * Key limitations:
 *   - API access requires an approved Payoneer for Platforms partnership
 *   - Transaction inquiry APIs are only available to platforms with direct
 *     Payoneer integration contracts
 *   - No public sandbox environment exists for testing
 *   - Account-to-account payments cannot be verified via API without the
 *     partner relationship
 *
 * If a Payoneer partnership is established, the verification flow would:
 *   1. Authenticate using client_id and client_secret
 *   2. POST to https://myaccount.paypal.com/api/v1/payment/query (or the
 *      Payoneer-equivalent endpoint provided under the partnership agreement)
 *   3. Check the transaction status and amount
 *
 * For now, Payoneer payments must always be manually verified by an admin.
 */

function isConfigured(): boolean {
  return Boolean(
    process.env.PAYONEER_CLIENT_ID && process.env.PAYONEER_CLIENT_SECRET
  )
}

export const payoneerAdapter: PaymentVerificationAdapter = {
  async verifyPayment(
    _params: PaymentVerificationParams
  ): Promise<PaymentVerificationResult> {
    return {
      success: false,
      message:
        'Payoneer API requires enterprise partnership. ' +
        'Payoneer does not offer a self-service verification API. ' +
        'Payments must be manually approved in the admin panel. ' +
        'To enable auto-verification, establish a Payoneer for Platforms partnership ' +
        'and configure PAYONEER_CLIENT_ID and PAYONEER_CLIENT_SECRET.',
    }
  },

  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (isConfigured()) {
      return {
        success: false,
        message:
          'Payoneer credentials are configured but API access requires an enterprise partnership. ' +
          'Contact Payoneer to enable platform integration.',
      }
    }

    return {
      success: false,
      message:
        'Payoneer API requires enterprise partnership. ' +
        'No public sandbox or API key provisioning is available. ' +
        'Payments will be handled in manual mode.',
    }
  },
}
