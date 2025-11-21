/*
  # Update betting system to support 5 houses
  
  1. Changes
    - Update house_type check constraint to support houses A through E
*/

DO $$ 
BEGIN
  ALTER TABLE bets DROP CONSTRAINT IF EXISTS valid_house_type;
  ALTER TABLE bets ADD CONSTRAINT valid_house_type 
    CHECK (house_type = ANY (ARRAY['A'::text, 'B'::text, 'C'::text, 'D'::text, 'E'::text]));
END $$;