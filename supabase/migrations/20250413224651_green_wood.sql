/*
  # Add phone number to user metadata
  
  1. Changes
    - Add phone number to user metadata
    - Update list_users function to include phone number
*/

-- Update list_users function to ensure phone number is included
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
        jsonb_build_object('status', 'active')
      WHEN users.raw_user_meta_data->>'status' IS NULL THEN
        users.raw_user_meta_data || jsonb_build_object('status', 'active')
      ELSE 
        users.raw_user_meta_data
    END as raw_user_meta_data
  FROM auth.users;
END;
$$;