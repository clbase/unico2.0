/*
  # Fix list_users function return type

  1. Changes
    - Drop existing list_users function
    - Recreate list_users function with correct return type
*/

-- First drop the existing function
DROP FUNCTION IF EXISTS list_users();

-- Recreate the function with the correct return type
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