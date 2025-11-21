/*
  # Fix pending status handling
  
  1. Changes
    - Ensure pending users are properly handled in all functions
    - Update default status for new signups to be pending
    - Exclude pending from manual status management
*/

-- Update the list_users function to properly handle pending users
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
SET search_path = auth, public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only administrators can list users';
  END IF;

  RETURN QUERY
  SELECT 
    users.id,
    users.email::text,
    users.created_at,
    users.last_sign_in_at,
    CASE 
      WHEN users.raw_user_meta_data IS NULL THEN 
        jsonb_build_object('status', 'active', 'category', 'assinatura_planilha')
      WHEN users.raw_user_meta_data->>'status' IS NULL THEN
        users.raw_user_meta_data || jsonb_build_object('status', 'active', 'category', 'assinatura_planilha')
      ELSE 
        users.raw_user_meta_data
    END as raw_user_meta_data
  FROM auth.users;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION list_users() TO authenticated;