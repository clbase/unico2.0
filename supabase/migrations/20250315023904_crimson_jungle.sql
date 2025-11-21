/*
  # Fix password reset functionality
  
  1. Changes
    - Update reset_user_password function to properly reset password to '000000'
    - Use proper password hashing with auth.users
*/

-- Drop existing function
DROP FUNCTION IF EXISTS reset_user_password(uuid);

-- Recreate function with proper password reset
CREATE OR REPLACE FUNCTION reset_user_password(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only administrators can reset passwords';
  END IF;

  -- Update user's password to '000000' and mark for change
  UPDATE auth.users
  SET 
    encrypted_password = crypt('000000', gen_salt('bf')),
    raw_user_meta_data = 
      CASE 
        WHEN raw_user_meta_data IS NULL THEN 
          jsonb_build_object('needs_password_change', true)
        ELSE 
          raw_user_meta_data || jsonb_build_object('needs_password_change', true)
      END,
    email_confirmed_at = COALESCE(email_confirmed_at, now())
  WHERE id = target_user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION reset_user_password(uuid) TO authenticated;