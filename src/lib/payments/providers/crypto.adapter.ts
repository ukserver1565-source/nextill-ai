import type {
  PaymentVerificationAdapter,
  PaymentVerificationParams,
  PaymentVerificationResult,
} from './types'

/**
 * Cryptocurrency Payment Verification Adapter — ALWAYS MANUAL
 *
 * Cryptocurrency payments have no single centralized API for real-time
 * transaction verification across all supported chains and tokens.
 *
 * Why crypto verification is always manual:
 *   - Each blockchain (Bitcoin, Ethereum, USDT/ERC-20, etc.) has different
 *     confirmation requirements and block times
 *   - Confirmations are probabilistic — a transaction is considered final
 *     after N confirmations, which varies by chain
 *   - No universal "payment status" endpoint exists across chains
 *   - Wallet address verification requires chain-specific node RPC calls
 *   - Exchange rate volatility means the received amount may differ from
 *     the invoiced amount even after confirmation
 *
 * The recommended workflow for crypto payments:
 *   1. Customer is shown a wallet address and the amount in crypto
 *   2. Customer sends the transaction
 *   3. Admin monitors the blockchain (or uses a block explorer) to confirm
 *   4. Admin manually approves the payment after sufficient confirmations
 *
 * Future enhancement: A production system could integrate with a blockchain
 * explorer API (e.g., Blockchair, Etherscan, Blockchain.com) to automate
 * confirmation checking. This is out of scope for the current implementation.
 */
export const cryptoAdapter: PaymentVerificationAdapter = {
  async verifyPayment(
    _params: PaymentVerificationParams
  ): Promise<PaymentVerificationResult> {
    return {
      success: false,
      message:
        'Crypto payments require manual admin approval. ' +
        'Blockchain transaction verification is not automated in this system.',
    }
  },

  async testConnection(): Promise<{ success: boolean; message: string }> {
    return {
      success: false,
      message:
        'Crypto payments cannot be auto-verified. ' +
        'This payment method always operates in manual mode.',
    }
  },
}
