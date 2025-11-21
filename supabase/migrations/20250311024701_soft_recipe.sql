/*
  # Add returned status to bets table

  1. Changes
    - Update status check constraint to include 'returned' status option
*/

DO $$ 
BEGIN
  ALTER TABLE bets DROP CONSTRAINT IF EXISTS bets_status_check;
  ALTER TABLE bets ADD CONSTRAINT bets_status_check 
    CHECK (status = ANY (ARRAY['pending'::text, 'won'::text, 'lost'::text, 'returned'::text]));
END $$;