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

  console.log('=== Square Payment Function Started ===')
  console.log('Request method:', req.method)
  console.log('Request headers:', Object.fromEntries(req.headers.entries()))

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://ewjfnquypoeyoicmgbnp.supabase.co'
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    console.log('Supabase URL:', supabaseUrl)
    console.log('Service key exists:', !!supabaseServiceKey)
    
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
    
    console.log('Request body:', {
      sourceId: sourceId?.substring(0, 10) + '...',
      amount,
      coinAmount
    })

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
    
    console.log('Square environment:', squareEnvironment)
    console.log('Square access token exists:', !!squareAccessToken)
    console.log('Square location ID exists:', !!squareLocationId)
    
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

    console.log('Creating Square payment with:', {
      sourceId: sourceId?.substring(0, 10) + '...',
      amount: amount,
      currency: 'JPY',
      locationId: squareLocationId
    })

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
        // In production, implement proper refund logic
        console.error('Database error:', dbError)
        throw new Error('Failed to update coin balance')
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