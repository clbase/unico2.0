/*
  # Create Shares Table

  ## 1. New Tables
    - `shares`
      - `id` (uuid, primary key)
      - `code` (text, unique) - Share code for URL
      - `type` (text) - Calculator type (dutching, limitation, aumentada)
      - `data` (jsonb) - Stored calculation data
      - `total_stake` (numeric, nullable) - Total stake amount
      - `expires_at` (timestamptz) - Expiration date (5 days)
      - `created_at` (timestamptz)

  ## 2. Security
    - Enable RLS
    - Anyone can read shares (needed for sharing links)
    - Anyone can create shares (needed for generating share links)

  ## 3. Important Notes
    - Shares expire after 5 days
    - Code must be unique for lookup
*/

-- Create shares table
CREATE TABLE IF NOT EXISTS shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  type text NOT NULL,
  data jsonb NOT NULL,
  total_stake numeric,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_shares_code ON shares(code);
CREATE INDEX IF NOT EXISTS idx_shares_expires_at ON shares(expires_at);

-- Enable RLS
ALTER TABLE shares ENABLE ROW LEVEL SECURITY;

-- Shares policies
CREATE POLICY "Anyone can read unexpired shares"
  ON shares FOR SELECT
  USING (expires_at > now());

CREATE POLICY "Anyone can create shares"
  ON shares FOR INSERT
  WITH CHECK (true);

-- Cleanup old shares function (optional, can be run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_shares()
RETURNS void AS $$
BEGIN
  DELETE FROM shares WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
