import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2'
import { Client, Environment } from 'https://esm.sh/square@36.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PaymentRequest {
  sourceId: string // Card token from Square Web Payments SDK
  amount: number // Amount in JPY
  coinAmount: number // Number of coins to purchase
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Square Payment Function Started

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://ewjfnquypoeyoicmgbnp.supabase.co'
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseServiceKey) {
      console.error('SUPABASE_SERVICE_ROLE_KEY is missing!')
      return new Response(
        JSON.stringify({ error: 'Server configuration error: Missing service key' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get user from JWT
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const requestBody = await req.json() as PaymentRequest
    const { sourceId, amount, coinAmount } = requestBody
    
    // Request body processed

    // Validate amount (minimum 100 JPY)
    if (amount < 100 || coinAmount < 1) {
      return new Response(
        JSON.stringify({ error: 'Invalid amount' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Square client
    const squareAccessToken = Deno.env.get('SQUARE_ACCESS_TOKEN')
    const squareEnvironment = Deno.env.get('SQUARE_ENVIRONMENT') || 'sandbox'
    const squareLocationId = Deno.env.get('SQUARE_LOCATION_ID')
    
    if (!squareAccessToken) {
      console.error('SQUARE_ACCESS_TOKEN is missing!')
      return new Response(
        JSON.stringify({ 
          error: 'Server configuration error: Missing Square access token',
          details: 'SQUARE_ACCESS_TOKEN environment variable is required'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    if (!squareLocationId) {
      console.error('SQUARE_LOCATION_ID is missing!')
      return new Response(
        JSON.stringify({ 
          error: 'Server configuration error: Missing Square location ID',
          details: 'SQUARE_LOCATION_ID environment variable is required'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const client = new Client({
      accessToken: squareAccessToken,
      environment: squareEnvironment === 'production' ? Environment.Production : Environment.Sandbox,
    })

    // Create payment
    const paymentsApi = client.paymentsApi
    const idempotencyKey = crypto.randomUUID()

    // Creating Square payment

    try {
      const { result } = await paymentsApi.createPayment({
        sourceId,
        idempotencyKey,
        amountMoney: {
          amount: BigInt(amount), // JPY amount as-is (no conversion needed)
          currency: 'JPY',
        },
        locationId: squareLocationId,
        note: `Purchase of ${coinAmount} coins for user ${user.id}`,
        referenceId: user.id,
        // 住所情報を含めない設定
        autocomplete: false,
        // レシートに個人情報を含めない
        receiptOptions: {
          isPrintReceiptEnabled: false,
          isEmailReceiptEnabled: false,
        },
      })

      const payment = result.payment

      if (!payment) {
        throw new Error('Payment result is null')
      }
      
      if (payment.status !== 'COMPLETED') {
        throw new Error(`Payment failed with status: ${payment.status}. Details: ${JSON.stringify(payment)}`)
      }

      // Add coins to user account using the database function
      const { data: transaction, error: dbError } = await supabase.rpc('add_coins', {
        p_user_id: user.id,
        p_amount: coinAmount,
        p_description: `購入: ${coinAmount}コイン`,
        p_square_payment_id: payment.id,
        p_square_receipt_url: payment.receiptUrl || null,
      })

      if (dbError) {
        // If database update fails, we should refund the payment
        console.error('Database error:', dbError)
        console.error('Attempting to refund payment:', payment.id)
        
        try {
          // Attempt to refund the payment
          const refundsApi = client.refundsApi
          const refundIdempotencyKey = crypto.randomUUID()
          
          const { result: refundResult } = await refundsApi.refundPayment({
            paymentId: payment.id,
            idempotencyKey: refundIdempotencyKey,
            amountMoney: {
              amount: BigInt(amount),
              currency: 'JPY',
            },
            reason: 'Database update failed - automatic refund',
          })
          
          // Refund successful
          
          return new Response(
            JSON.stringify({ 
              error: 'Payment processed but coin balance update failed',
              refundId: refundResult.refund?.id,
              refundStatus: refundResult.refund?.status,
              message: 'Payment has been automatically refunded. Please try again or contact support.',
              details: dbError.message
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500,
            }
          )
        } catch (refundError) {
          console.error('Refund also failed:', refundError)
          
          // Critical error - payment successful but couldn't refund
          return new Response(
            JSON.stringify({ 
              error: 'Critical payment error',
              paymentId: payment.id,
              message: 'Payment was processed but coin balance could not be updated. Refund also failed. Please contact support immediately.',
              details: {
                dbError: dbError.message,
                refundError: refundError.message
              }
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500,
            }
          )
        }
      }

      // Get updated user data
      const { data: updatedUser } = await supabase
        .from('users')
        .select('coin_balance')
        .eq('id', user.id)
        .single()

      return new Response(
        JSON.stringify({
          success: true,
          payment: {
            id: payment.id,
            amount: Number(payment.amountMoney?.amount),
            status: payment.status,
            receiptUrl: payment.receiptUrl,
          },
          transaction,
          coinBalance: updatedUser?.coin_balance || 0,
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    } catch (error) {
      console.error('Square API error:', error)
      console.error('Error type:', error.constructor.name)
      console.error('Error details:', error.errors || 'No additional error details')
      
      return new Response(
        JSON.stringify({ 
          error: 'Payment processing failed',
          details: error.message,
          type: error.constructor.name,
          squareErrors: error.errors || null
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }
  } catch (error) {
    console.error('=== Unexpected error ===')
    console.error('Error type:', error.constructor.name)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    console.error('Full error object:', JSON.stringify(error, null, 2))
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message,
        type: error.constructor.name
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})