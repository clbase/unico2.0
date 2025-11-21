/*
  # Add Bankroll Management Tables
  
  1. Changes
    - Drop existing policies before recreating them
    - Ensure idempotent table creation
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can create their own betting houses" ON betting_houses;
    DROP POLICY IF EXISTS "Users can view their own betting houses" ON betting_houses;
    DROP POLICY IF EXISTS "Users can update their own betting houses" ON betting_houses;
    DROP POLICY IF EXISTS "Users can create their own transactions" ON bankroll_transactions;
    DROP POLICY IF EXISTS "Users can view their own transactions" ON bankroll_transactions;
EXCEPTION
    WHEN undefined_table THEN
        NULL;
END $$;

-- Create betting houses table
CREATE TABLE IF NOT EXISTS betting_houses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  balance numeric DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Create bankroll transactions table
CREATE TABLE IF NOT EXISTS bankroll_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  betting_house_id uuid REFERENCES betting_houses NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  amount numeric NOT NULL,
  type text NOT NULL CHECK (type IN ('deposit', 'withdrawal')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE betting_houses ENABLE ROW LEVEL SECURITY;
ALTER TABLE bankroll_transactions ENABLE ROW LEVEL SECURITY;

-- Policies for betting_houses
CREATE POLICY "Users can create their own betting houses"
  ON betting_houses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own betting houses"
  ON betting_houses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own betting houses"
  ON betting_houses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for bankroll_transactions
CREATE POLICY "Users can create their own transactions"
  ON bankroll_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own transactions"
  ON bankroll_transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);