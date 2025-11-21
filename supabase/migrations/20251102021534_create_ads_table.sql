/*
  # Create Ads Table with Supabase Auth

  1. New Table
    - `ads`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `content` (text, not null)
      - `link_url` (text, nullable)
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz, default now)
      - `updated_at` (timestamptz, default now)
      - `created_by` (uuid) - references auth.users
  
  2. Security
    - Enable RLS on ads table
    - Public can read active ads only
    - Authenticated users can manage ads (CRUD)
    - Uses Supabase Auth for authentication
*/

CREATE TABLE IF NOT EXISTS ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  link_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

ALTER TABLE ads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active ads"
  ON ads
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can insert ads"
  ON ads
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Authenticated users can update ads"
  ON ads
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Authenticated users can delete ads"
  ON ads
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());