-- Add coin balance to users table
ALTER TABLE users ADD COLUMN coin_balance INTEGER DEFAULT 0 NOT NULL CHECK (coin_balance >= 0);

-- Create coin transactions table
CREATE TABLE coin_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('purchase', 'spend', 'refund')),
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  description TEXT,
  square_payment_id TEXT, -- Square payment ID for purchases
  square_receipt_url TEXT, -- Square receipt URL
  post_id UUID REFERENCES posts(id) ON DELETE SET NULL, -- Post ID for spending
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  metadata JSONB DEFAULT '{}' NOT NULL
);

-- Add priority display columns to posts table
ALTER TABLE posts ADD COLUMN is_priority BOOLEAN DEFAULT FALSE NOT NULL;
ALTER TABLE posts ADD COLUMN priority_expires_at TIMESTAMPTZ;
ALTER TABLE posts ADD COLUMN priority_cost INTEGER DEFAULT 0 NOT NULL;

-- Create indexes
CREATE INDEX idx_coin_transactions_user_id ON coin_transactions(user_id);
CREATE INDEX idx_coin_transactions_created_at ON coin_transactions(created_at DESC);
CREATE INDEX idx_posts_priority ON posts(is_priority, priority_expires_at) WHERE is_priority = TRUE;

-- Enable RLS
ALTER TABLE coin_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for coin_transactions
CREATE POLICY "Users can view their own transactions" ON coin_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert transactions" ON coin_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to update priority status
CREATE OR REPLACE FUNCTION update_expired_priorities()
RETURNS void AS $$
BEGIN
  UPDATE posts
  SET is_priority = FALSE
  WHERE is_priority = TRUE
    AND priority_expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle coin spending
CREATE OR REPLACE FUNCTION spend_coins(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT,
  p_post_id UUID DEFAULT NULL
)
RETURNS coin_transactions AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
  v_transaction coin_transactions;
BEGIN
  -- Lock the user row to prevent concurrent modifications
  SELECT coin_balance INTO v_current_balance
  FROM users
  WHERE id = p_user_id
  FOR UPDATE;

  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient coin balance';
  END IF;

  -- Update user balance
  v_new_balance := v_current_balance - p_amount;
  UPDATE users
  SET coin_balance = v_new_balance
  WHERE id = p_user_id;

  -- Create transaction record
  INSERT INTO coin_transactions (
    user_id,
    transaction_type,
    amount,
    balance_after,
    description,
    post_id
  ) VALUES (
    p_user_id,
    'spend',
    -p_amount,
    v_new_balance,
    p_description,
    p_post_id
  ) RETURNING * INTO v_transaction;

  RETURN v_transaction;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to add coins
CREATE OR REPLACE FUNCTION add_coins(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT,
  p_square_payment_id TEXT DEFAULT NULL,
  p_square_receipt_url TEXT DEFAULT NULL
)
RETURNS coin_transactions AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
  v_transaction coin_transactions;
BEGIN
  -- Lock the user row
  SELECT coin_balance INTO v_current_balance
  FROM users
  WHERE id = p_user_id
  FOR UPDATE;

  -- Update user balance
  v_new_balance := v_current_balance + p_amount;
  UPDATE users
  SET coin_balance = v_new_balance
  WHERE id = p_user_id;

  -- Create transaction record
  INSERT INTO coin_transactions (
    user_id,
    transaction_type,
    amount,
    balance_after,
    description,
    square_payment_id,
    square_receipt_url
  ) VALUES (
    p_user_id,
    'purchase',
    p_amount,
    v_new_balance,
    p_description,
    p_square_payment_id,
    p_square_receipt_url
  ) RETURNING * INTO v_transaction;

  RETURN v_transaction;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;