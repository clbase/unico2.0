/*
  # Add earnings table for external profits and losses

  1. New Tables
    - `earnings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `type` (text: 'profit' or 'loss')
      - `house_name` (text)
      - `amount` (numeric)
      - `observation` (text, nullable)
      - `event_date` (date)
      - `event_time` (time)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `earnings` table
    - Add policies for CRUD operations
*/

CREATE TABLE IF NOT EXISTS earnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  type text NOT NULL CHECK (type IN ('profit', 'loss')),
  house_name text NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  observation text,
  event_date date NOT NULL,
  event_time time NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE earnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own earnings"
  ON earnings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own earnings"
  ON earnings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own earnings"
  ON earnings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own earnings"
  ON earnings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);