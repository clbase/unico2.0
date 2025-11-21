/*
  # Add odds and dutching calculations

  1. Changes
    - Add odds columns with defaults
    - Add dutching_investment column
    - Add house_type column
    - Remove result column
    - Update existing data
    - Add NOT NULL constraints

  2. Security
    - Maintain existing RLS policies
*/

-- First add columns without NOT NULL constraint
ALTER TABLE bets 
ADD COLUMN odds numeric,
ADD COLUMN dutching_investment numeric,
ADD COLUMN house_type text;

-- Set default values for existing rows
UPDATE bets
SET odds = 2.0,  -- Default odds of 2.0 for existing bets
    dutching_investment = investment,  -- Use existing investment as dutching investment
    house_type = 'A';  -- Mark existing bets as house A

-- Now add NOT NULL constraints
ALTER TABLE bets 
ALTER COLUMN odds SET NOT NULL,
ALTER COLUMN dutching_investment SET NOT NULL,
ALTER COLUMN house_type SET NOT NULL;

-- Add check constraint for house_type
ALTER TABLE bets 
ADD CONSTRAINT valid_house_type CHECK (house_type IN ('A', 'B'));

-- Remove old result column as it's no longer needed
ALTER TABLE bets DROP COLUMN result;