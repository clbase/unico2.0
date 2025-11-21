/*
  # Update ads table with image support and fix interval behavior

  1. Changes
    - Add image_url column to store ad images
    - Clarify display_duration_seconds is for ad rotation (not popup interval)
    - Popup interval is now 30 minutes (controlled in frontend)
    - Ensure proper RLS policies

  2. Security
    - Maintain RLS on ads table
    - Only authenticated users (admins) can modify ads
*/

-- Create ads table if it doesn't exist
CREATE TABLE IF NOT EXISTS ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  link_url text,
  image_url text,
  display_duration_seconds integer DEFAULT 10 CHECK (display_duration_seconds >= 3 AND display_duration_seconds <= 60),
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add image_url column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ads' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE ads ADD COLUMN image_url text;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view active ads" ON ads;
DROP POLICY IF EXISTS "Authenticated users can create ads" ON ads;
DROP POLICY IF EXISTS "Authenticated users can update ads" ON ads;
DROP POLICY IF EXISTS "Authenticated users can delete ads" ON ads;

-- Create policies
CREATE POLICY "Anyone can view active ads"
  ON ads
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Authenticated users can create ads"
  ON ads
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update ads"
  ON ads
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete ads"
  ON ads
  FOR DELETE
  TO authenticated
  USING (true);
