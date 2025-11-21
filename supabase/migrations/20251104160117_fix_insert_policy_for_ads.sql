/*
  # Fix Insert Policy for Ads

  ## Summary
  The INSERT policy was too restrictive - it required created_by to equal auth.uid(),
  but we're allowing admins to create ads with an optional created_by field.
  
  ## Changes
  - Update INSERT policy to allow any value for created_by
  - Keep UPDATE and DELETE policies flexible
*/

-- Drop the restrictive insert policy
DROP POLICY IF EXISTS "Authenticated users can create ads" ON ads;

-- Create new permissive insert policy
CREATE POLICY "Authenticated users can create ads"
  ON ads FOR INSERT
  TO authenticated
  WITH CHECK (true);
