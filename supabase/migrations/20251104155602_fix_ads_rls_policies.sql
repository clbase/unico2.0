/*
  # Fix Ads RLS Policies

  ## Summary
  Remove restrictive RLS policies that prevented authenticated users from updating/deleting ads.
  
  ## Changes
  - Drop old restrictive policies
  - Create new permissive policies that allow all authenticated users to manage ads
  - Maintain public read access for active ads only
*/

-- Drop old restrictive policies
DROP POLICY IF EXISTS "Anyone can view active ads" ON ads;
DROP POLICY IF EXISTS "Authenticated users can read all ads" ON ads;
DROP POLICY IF EXISTS "Authenticated users can create ads" ON ads;
DROP POLICY IF EXISTS "Authenticated users can update ads" ON ads;
DROP POLICY IF EXISTS "Authenticated users can delete ads" ON ads;

-- Create new policies
CREATE POLICY "Anyone can read active ads"
  ON ads FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can read all ads"
  ON ads FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create ads"
  ON ads FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update any ad"
  ON ads FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete any ad"
  ON ads FOR DELETE
  TO authenticated
  USING (true);
