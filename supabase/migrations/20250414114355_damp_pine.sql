/*
  # Create shares table for calculator data

  1. New Tables
    - `shares`
      - `id` (uuid, primary key)
      - `code` (text, unique) - The share code
      - `type` (text) - Calculator type (dutching, limitation, aumentada)
      - `data` (jsonb) - The calculator data
      - `total_stake` (numeric) - Total stake amount
      - `expires_at` (timestamptz) - When the share expires
      - `created_at` (timestamptz) - When the share was created

  2. Security
    - Enable RLS on `shares` table
    - Add policy for authenticated users to read their own data
    - Add policy for anonymous users to read any share
    - Add policy for authenticated users to create shares
*/

CREATE TABLE shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  type text NOT NULL CHECK (type IN ('dutching', 'limitation', 'aumentada')),
  data jsonb NOT NULL,
  total_stake numeric,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE shares ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read shares
CREATE POLICY "Anyone can read shares"
  ON shares
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to create shares
CREATE POLICY "Authenticated users can create shares"
  ON shares
  FOR INSERT
  TO authenticated
  WITH CHECK (true);