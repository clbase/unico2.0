/*
  # Update RLS policies for bets table

  1. Security Changes
    - Update RLS policy for bet creation to use auth.uid()
    - Ensure users can only create bets with their own user_id
*/

DROP POLICY IF EXISTS "Users can create their own bets" ON bets;

CREATE POLICY "Users can create their own bets"
ON bets
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);