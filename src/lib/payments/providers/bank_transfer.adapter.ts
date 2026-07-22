import type {
  PaymentVerificationAdapter,
  PaymentVerificationParams,
  PaymentVerificationResult,
} from './types'

/**
 * Bank Transfer Payment Verification Adapter — ALWAYS MANUAL
 *
 * Bank transfers have no automatable real-time API.
 *
 * Unlike card or wallet payments, bank transfers (wire transfers, SEPA, ACH,
 * local bank deposits, etc.) involve:
 *   - No standardized real-time inquiry API across banks
 *   - Settlement times ranging from instant (Faster Payments) to 3 business days (wire)
 *   - No transaction ID that can be queried programmatically across institutions
 *   - Manual reconciliation using bank statements
 *
 * This provider ALWAYS stays in manual mode regardless of any credentials
 * or configuration. Admin approval is required for every bank transfer payment.
 *
 * The recommended workflow for bank transfers:
 *   1. Customer initiates transfer and is shown bank details
 *   2. Customer uploads proof of transfer (screenshot/reference)
 *   3. Admin reviews the proof against the bank statement
 *   4. Admin approves or rejects the payment
 */
export const bankTransferAdapter: PaymentVerificationAdapter = {
  async verifyPayment(
    _params: PaymentVerificationParams
  ): Promise<PaymentVerificationResult> {
    return {
      success: false,
      message:
        'Bank transfers require manual admin approval. ' +
        'There is no real-time API to verify bank transfer payments.',
    }
  },

  async testConnection(): Promise<{ success: boolean; message: string }> {
    return {
      success: false,
      message:
        'Bank transfers cannot be auto-verified. ' +
        'This payment method always operates in manual mode.',
    }
  },
}
