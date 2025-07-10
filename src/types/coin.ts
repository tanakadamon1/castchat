export interface CoinTransaction {
  id: string
  user_id: string
  transaction_type: 'purchase' | 'spend' | 'refund'
  amount: number
  balance_after: number
  description?: string
  square_payment_id?: string
  square_receipt_url?: string
  post_id?: string
  created_at: string
  metadata?: Record<string, any>
}

export interface CoinPurchaseOption {
  id: string
  coins: number
  price: number
  bonus?: number
  popular?: boolean
  description?: string
}

export interface PaymentResult {
  success: boolean
  payment?: {
    id: string
    amount: number
    status: string
    receiptUrl?: string
  }
  transaction?: CoinTransaction
  coinBalance: number
  error?: string
}

export interface SquarePaymentRequest {
  sourceId: string
  amount: number
  coinAmount: number
  locationId: string
}