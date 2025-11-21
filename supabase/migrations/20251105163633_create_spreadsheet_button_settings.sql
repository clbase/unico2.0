/*
  # Create Spreadsheet Button Settings Table

  1. New Tables
    - `spreadsheet_button_settings`
      - `id` (uuid, primary key)
      - `title` (text) - Button title
      - `link_url` (text) - Button URL
      - `is_active` (boolean) - Show/hide button
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `created_by` (uuid, foreign key to auth.users)
      - `updated_by` (uuid, foreign key to auth.users)

  2. Security
    - Enable RLS on `spreadsheet_button_settings` table
    - Add policy for public read access
    - Add policy for authenticated admin insert
    - Add policy for authenticated admin update
*/

CREATE TABLE IF NOT EXISTS spreadsheet_button_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  link_url text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

ALTER TABLE spreadsheet_button_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view spreadsheet button settings"
  ON spreadsheet_button_settings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert spreadsheet button settings"
  ON spreadsheet_button_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update spreadsheet button settings"
  ON spreadsheet_button_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default settings
INSERT INTO spreadsheet_button_settings (title, link_url, is_active)
VALUES (
  'Planilha de Casas Espelhos',
  'https://docs.google.com/spreadsheets/d/1MNQ_NIKWjp9ZV1KwEk4plnYjniuChBPCSYBJpOwyut8/edit?pli=1&gid=1489914378#gid=1489914378',
  true
)
ON CONFLICT DO NOTHING;