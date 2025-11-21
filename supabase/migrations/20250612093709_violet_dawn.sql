/*
  # Add force logout functionality
  
  1. New Functions
    - force_logout_user: Function to force logout a user by updating their session
    - check_force_logout: Function to check if user was force logged out
    
  2. Security
    - Only admins can force logout users
    - Protected admin cannot be force logged out by others
*/

-- Function to force logout a user
CREATE OR REPLACE FUNCTION force_logout_user(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_email text;
  executing_user_email text;
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only administrators can force logout users';
  END IF;

  -- Get the email of the target user and executing user
  SELECT email INTO target_email
  FROM auth.users
  WHERE id = target_user_id;

  SELECT email INTO executing_user_email
  FROM auth.users
  WHERE id = auth.uid();

  IF target_email IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Prevent force logout of protected admin
  IF target_email = 'claiverg@gmail.com' AND executing_user_email != 'claiverg@gmail.com' THEN
    RAISE EXCEPTION 'Cannot force logout the main administrator';
  END IF;

  -- Update user metadata to indicate they were force logged out
  UPDATE auth.users
  SET raw_user_meta_data = 
    CASE 
      WHEN raw_user_meta_data IS NULL THEN 
        jsonb_build_object('force_logout', true, 'force_logout_time', CURRENT_TIMESTAMP::text)
      ELSE 
        raw_user_meta_data || jsonb_build_object('force_logout', true, 'force_logout_time', CURRENT_TIMESTAMP::text)
    END
  WHERE id = target_user_id;
END;
$$;

-- Function to check if user was force logged out
CREATE OR REPLACE FUNCTION check_force_logout()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'force_logout' = 'true'
  );
END;
$$;

-- Function to clear force logout flag
CREATE OR REPLACE FUNCTION clear_force_logout()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE auth.users
  SET raw_user_meta_data = raw_user_meta_data - 'force_logout' - 'force_logout_time'
  WHERE id = auth.uid()
  AND raw_user_meta_data->>'force_logout' = 'true';
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION force_logout_user(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION check_force_logout() TO authenticated;
GRANT EXECUTE ON FUNCTION clear_force_logout() TO authenticated;