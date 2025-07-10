import { supabase } from '@/lib/supabase'
import type { CoinTransaction, PaymentResult, SquarePaymentRequest } from '@/types/coin'

export class CoinApi {
  static async getCoinBalance(): Promise<number> {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('users')
      .select('coin_balance')
      .eq('id', user.user.id)
      .single()

    if (error) throw error
    return data?.coin_balance || 0
  }

  static async getCoinTransactions(limit = 20): Promise<CoinTransaction[]> {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('coin_transactions')
      .select('*')
      .eq('user_id', user.user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  }

  static async purchaseCoins(request: SquarePaymentRequest): Promise<PaymentResult> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/square-payment`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(request),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Payment failed')
    }

    return await response.json()
  }

  static async spendCoins(amount: number, description: string, postId?: string): Promise<CoinTransaction> {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) throw new Error('Not authenticated')

    const { data, error } = await supabase.rpc('spend_coins', {
      p_user_id: user.user.id,
      p_amount: amount,
      p_description: description,
      p_post_id: postId,
    })

    if (error) throw error
    return data
  }

  static async enablePriorityDisplay(postId: string): Promise<void> {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) throw new Error('Not authenticated')

    // First, spend the coin
    await this.spendCoins(1, '優先表示（24時間）', postId)

    // Then update the post
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    const { error } = await supabase
      .from('posts')
      .update({
        is_priority: true,
        priority_expires_at: expiresAt.toISOString(),
        priority_cost: 1,
      })
      .eq('id', postId)
      .eq('user_id', user.user.id)

    if (error) throw error
  }
}

export const coinPurchaseOptions = [
  {
    id: 'coin-1',
    coins: 1,
    price: 100,
    description: '1コイン',
  },
  {
    id: 'coin-5',
    coins: 5,
    price: 500,
    description: '5コイン',
  },
  {
    id: 'coin-10',
    coins: 10,
    price: 1000,
    description: '10コイン',
  },
  {
    id: 'coin-20',
    coins: 20,
    price: 1800,
    bonus: 200,
    description: '20コイン',
    popular: true,
  },
  {
    id: 'coin-50',
    coins: 50,
    price: 4500,
    bonus: 500,
    description: '50コイン',
  },
]