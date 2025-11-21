/*
  # Protect admin status for specific user
  
  1. Changes
    - Modify set_admin_status function to prevent removing admin from specific email
    - Add check to ensure the protected admin cannot be deleted
*/

-- First, modify the set_admin_status function to protect specific admin
CREATE OR REPLACE FUNCTION set_admin_status(target_user_id uuid, is_admin_status boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_email text;
BEGIN
  -- Check if the executing user is an admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only administrators can modify admin status';
  END IF;

  -- Get the email of the target user
  SELECT email INTO target_email
  FROM auth.users
  WHERE id = target_user_id;

  -- Prevent removing admin status from protected email
  IF target_email = 'claiverg@gmail.com' AND NOT is_admin_status THEN
    RAISE EXCEPTION 'Cannot remove admin status from protected administrator';
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

-- Modify the admin_delete_user function to protect specific admin
CREATE OR REPLACE FUNCTION admin_delete_user(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_email text;
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only administrators can delete other users';
  END IF;

  -- Get the email of the target user
  SELECT email INTO target_email
  FROM auth.users
  WHERE id = user_id;

  -- Prevent deleting protected admin
  IF target_email = 'claiverg@gmail.com' THEN
    RAISE EXCEPTION 'Cannot delete protected administrator account';
  END IF;

  -- Delete user's bets
  DELETE FROM bets WHERE user_id = user_id;
  
  -- Delete user from auth.users
  DELETE FROM auth.users WHERE id = user_id;
END;
$$;