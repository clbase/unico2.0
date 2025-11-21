/*
  # Fix list_users function to properly return users

  1. Changes
    - Drop existing list_users function
    - Recreate with proper schema references and permissions
    - Add explicit grants
*/

-- Drop existing function
DROP FUNCTION IF EXISTS list_users();

-- Recreate the function with proper schema references
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
    users.id,
    users.email::text,
    users.created_at,
    users.last_sign_in_at,
    users.raw_user_meta_data
  FROM auth.users;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION list_users() TO authenticated;

-- Grant usage on auth schema
GRANT USAGE ON SCHEMA auth TO authenticated;

-- Grant select on auth.users to the function
GRANT SELECT ON auth.users TO authenticated;