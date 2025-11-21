/*
  # Add market field to bets table

  1. Changes
    - Add market column to bets table
    - Update existing bets with default market value
    - Add NOT NULL constraint after setting defaults

  2. Security
    - Maintain existing RLS policies
*/

-- Add market column without NOT NULL constraint initially
ALTER TABLE bets 
ADD COLUMN market text;

-- Set default value for existing bets
UPDATE bets
SET market = 'Não especificado'
WHERE market IS NULL;

-- Now add NOT NULL constraint
ALTER TABLE bets 
ALTER COLUMN market SET NOT NULL;