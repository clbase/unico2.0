/*
  # Add user status management

  1. Changes
    - Add function to update user status
    - Add function to check user status
    - Update list_users to include status
*/

-- Function to update user status
CREATE OR REPLACE FUNCTION set_user_status(target_user_id uuid, status text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only administrators can modify user status';
  END IF;

  IF status NOT IN ('active', 'suspended') THEN
    RAISE EXCEPTION 'Invalid status. Must be either active or suspended';
  END IF;

  UPDATE auth.users
  SET raw_user_meta_data = 
    CASE 
      WHEN raw_user_meta_data IS NULL THEN 
        jsonb_build_object('status', status)
      ELSE 
        raw_user_meta_data || jsonb_build_object('status', status)
    END
  WHERE id = target_user_id;
END;
$$;

-- Function to check if user is suspended
CREATE OR REPLACE FUNCTION is_user_suspended(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_status text;
BEGIN
  SELECT (raw_user_meta_data->>'status')::text INTO user_status
  FROM auth.users
  WHERE id = user_id;
  
  RETURN COALESCE(user_status = 'suspended', false);
END;
$$;

-- Update list_users function to ensure status is included
DROP FUNCTION IF EXISTS list_users();

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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION set_user_status(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION is_user_suspended(uuid) TO authenticated;