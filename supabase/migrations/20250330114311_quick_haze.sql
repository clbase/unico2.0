-- Enable pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Drop existing function
DROP FUNCTION IF EXISTS reset_user_password(uuid);

-- Recreate function with proper password reset
CREATE OR REPLACE FUNCTION reset_user_password(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
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
    END,
    encrypted_password = extensions.crypt('000000', extensions.gen_salt('bf'))
  WHERE id = target_user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION reset_user_password(uuid) TO authenticated;