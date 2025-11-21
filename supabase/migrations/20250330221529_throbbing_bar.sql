/*
  # Add password reset functionality
  
  1. New Functions
    - reset_user_password: Function to reset a user's password
    - is_temporary_password: Function to check if user needs to change password
*/

-- Enable pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Function to reset user password
CREATE OR REPLACE FUNCTION reset_user_password(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_email text;
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only administrators can reset passwords';
  END IF;

  -- Get user's email
  SELECT email INTO target_email
  FROM auth.users
  WHERE id = target_user_id;

  IF target_email IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Update user metadata to indicate password needs to be reset
  UPDATE auth.users
  SET raw_user_meta_data = 
    CASE 
      WHEN raw_user_meta_data IS NULL THEN 
        jsonb_build_object('needs_password_change', true)
      ELSE 
        raw_user_meta_data || jsonb_build_object('needs_password_change', true)
    END
  WHERE id = target_user_id;
END;
$$;

-- Function to check if password is temporary
CREATE OR REPLACE FUNCTION is_temporary_password()
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
    AND raw_user_meta_data->>'needs_password_change' = 'true'
  );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION reset_user_password(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION is_temporary_password() TO authenticated;