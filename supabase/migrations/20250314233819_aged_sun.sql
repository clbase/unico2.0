/*
  # Add function to list users for admin

  1. New Functions
    - list_users: Function to get all users with their metadata
    
  2. Security
    - Function is security definer to run with elevated privileges
    - Only admins can access the function
*/

CREATE OR REPLACE FUNCTION list_users()
RETURNS TABLE (
  id uuid,
  email text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  raw_user_meta_data jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only administrators can list users';
  END IF;

  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.created_at,
    u.last_sign_in_at,
    u.raw_user_meta_data
  FROM auth.users u
  ORDER BY u.created_at DESC;
END;
$$;