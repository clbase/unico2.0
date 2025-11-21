/*
  # Update bets table ordering
  
  1. Changes
    - Add index on group_id and created_at for proper ordering
    - Update existing index for better query performance
*/

-- Create index for ordering by group_id and created_at
CREATE INDEX IF NOT EXISTS idx_bets_ordering 
ON bets (group_id, created_at DESC);

-- Update existing index to include more relevant columns
DROP INDEX IF EXISTS idx_bets_group_id;
CREATE INDEX idx_bets_group_id_composite 
ON bets (group_id, house_type, created_at DESC);