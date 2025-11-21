/*
  # Add admin role and functions

  1. Changes
    - Add admin role to auth schema
    - Add function to check if user is admin
    - Add function to delete any user
    - Add admin policy to allowed_emails table
*/

-- Create admin role
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'is_admin' = 'true'
  );
$$;

-- Function to delete any user (admin only)
CREATE OR REPLACE FUNCTION admin_delete_user(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only administrators can delete other users';
  END IF;

  -- Delete user's bets
  DELETE FROM bets WHERE user_id = $1;
  
  -- Delete user from auth.users
  DELETE FROM auth.users WHERE id = $1;
END;
$$;

-- Add admin policy to allowed_emails
CREATE POLICY "Admins can manage allowed emails"
  ON allowed_emails
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());