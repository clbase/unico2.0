/*
  # Create allowed emails table

  1. New Tables
    - `allowed_emails`
      - `email` (text, primary key)
      - `created_at` (timestamp)
      - `created_by` (uuid, references auth.users)

  2. Security
    - Enable RLS on `allowed_emails` table
    - Add policies for read access to authenticated users
*/

CREATE TABLE IF NOT EXISTS allowed_emails (
  email text PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users
);

ALTER TABLE allowed_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can check if email is allowed"
  ON allowed_emails
  FOR SELECT
  TO authenticated
  USING (true);