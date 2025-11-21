/*
  # Add admin management functions

  1. New Functions
    - set_admin_status: Function to set/unset admin status for a user
    - get_admin_status: Function to check if a user is an admin

  2. Security
    - Functions are security definer to run with elevated privileges
    - Only existing admins can set admin status
*/

-- Function to set admin status
CREATE OR REPLACE FUNCTION set_admin_status(target_user_id uuid, is_admin_status boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the executing user is an admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only administrators can modify admin status';
  END IF;

  -- Update the user's metadata
  UPDATE auth.users
  SET raw_user_meta_data = 
    CASE 
      WHEN raw_user_meta_data IS NULL THEN 
        jsonb_build_object('is_admin', is_admin_status::text)
      ELSE 
        raw_user_meta_data || jsonb_build_object('is_admin', is_admin_status::text)
    END
  WHERE id = target_user_id;
END;
$$;