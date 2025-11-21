/*
  # Add support for house C in bets table
  
  1. Changes
    - Update house_type check constraint to include 'C' option
*/

DO $$ 
BEGIN
  ALTER TABLE bets DROP CONSTRAINT IF EXISTS valid_house_type;
  ALTER TABLE bets ADD CONSTRAINT valid_house_type 
    CHECK (house_type = ANY (ARRAY['A'::text, 'B'::text, 'C'::text]));
END $$;