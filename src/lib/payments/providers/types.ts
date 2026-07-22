export interface PaymentVerificationParams {
  transactionId: string
  amount: number
  currency: string
}

export interface PaymentVerificationResult {
  success: boolean
  message: string
  rawResponse?: unknown
}

export interface PaymentVerificationAdapter {
  verifyPayment(params: PaymentVerificationParams): Promise<PaymentVerificationResult>
  testConnection(): Promise<{ success: boolean; message: string }>
}
