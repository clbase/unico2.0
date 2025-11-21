/*
  # Add delete policies for bankroll management
  
  1. Changes
    - Add delete policies for betting_houses and bankroll_transactions
    - Ensure cascading deletes work properly
*/

-- Add delete policy for betting_houses
CREATE POLICY "Users can delete their own betting houses"
  ON betting_houses
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add delete policy for bankroll_transactions
CREATE POLICY "Users can delete their own transactions"
  ON bankroll_transactions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add cascade delete to bankroll_transactions foreign key
ALTER TABLE bankroll_transactions
DROP CONSTRAINT IF EXISTS bankroll_transactions_betting_house_id_fkey,
ADD CONSTRAINT bankroll_transactions_betting_house_id_fkey
  FOREIGN KEY (betting_house_id)
  REFERENCES betting_houses(id)
  ON DELETE CASCADE;