/*
  # Add CASHOUT status to bets table

  1. Changes
    - Update status check constraint to include 'cashout' option
    - Add cashout_amount column to store the cashout value

  2. Security
    - Maintain existing RLS policies
*/

-- Add cashout_amount column
ALTER TABLE bets 
ADD COLUMN IF NOT EXISTS cashout_amount numeric DEFAULT 0;

-- Update status check constraint to include cashout
DO $$ 
BEGIN
  ALTER TABLE bets DROP CONSTRAINT IF EXISTS bets_status_check;
  ALTER TABLE bets ADD CONSTRAINT bets_status_check 
    CHECK (status = ANY (ARRAY['pending'::text, 'won'::text, 'lost'::text, 'returned'::text, 'cashout'::text]));
END $$;