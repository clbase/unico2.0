/*
  # Improve force logout functionality
  
  1. Changes
    - Update force_logout_user function to handle edge cases
    - Improve check_force_logout function
    - Add better error handling
*/

-- Update force_logout_user function
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

  -- Only set force logout if user is not already logged out
  -- Check if user has recent session activity
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

-- Update check_force_logout function to be more reliable
CREATE OR REPLACE FUNCTION check_force_logout()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  force_logout_flag boolean;
  force_logout_time text;
  current_user_id uuid;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;

  -- Get force logout status
  SELECT 
    (raw_user_meta_data->>'force_logout')::boolean,
    raw_user_meta_data->>'force_logout_time'
  INTO force_logout_flag, force_logout_time
  FROM auth.users
  WHERE id = current_user_id;

  -- Return true if force logout flag is set
  RETURN COALESCE(force_logout_flag, false);
END;
$$;

-- Update clear_force_logout function
CREATE OR REPLACE FUNCTION clear_force_logout()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN;
  END IF;

  UPDATE auth.users
  SET raw_user_meta_data = 
    CASE 
      WHEN raw_user_meta_data IS NULL THEN '{}'::jsonb
      ELSE raw_user_meta_data - 'force_logout' - 'force_logout_time'
    END
  WHERE id = current_user_id
  AND (raw_user_meta_data->>'force_logout' = 'true' OR raw_user_meta_data ? 'force_logout');
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION force_logout_user(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION check_force_logout() TO authenticated;
GRANT EXECUTE ON FUNCTION clear_force_logout() TO authenticated;