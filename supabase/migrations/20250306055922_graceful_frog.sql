/*
  # Initial Schema Setup for Betting Tracker

  1. New Tables
    - `bets`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `house_a` (text)
      - `house_b` (text)
      - `percentage` (numeric)
      - `investment` (numeric)
      - `event_date` (date)
      - `event_time` (time)
      - `created_at` (timestamp)
      - `result` (numeric, nullable)
      - `status` (text)

  2. Security
    - Enable RLS on `bets` table
    - Add policies for CRUD operations
*/

CREATE TABLE IF NOT EXISTS bets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  house_a text NOT NULL,
  house_b text NOT NULL,
  percentage numeric NOT NULL,
  investment numeric NOT NULL,
  event_date date NOT NULL,
  event_time time NOT NULL,
  created_at timestamptz DEFAULT now(),
  result numeric,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost')),
  CONSTRAINT percentage_range CHECK (percentage >= 0 AND percentage <= 100)
);

ALTER TABLE bets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own bets"
  ON bets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own bets"
  ON bets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own bets"
  ON bets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bets"
  ON bets
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);