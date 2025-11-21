/*
  # Fix admin_delete_user function ambiguous column reference
  
  1. Changes
    - Fix ambiguous column reference error in admin_delete_user function
    - Rename parameter to avoid conflicts with table columns
*/

-- Drop existing function
DROP FUNCTION IF EXISTS admin_delete_user(uuid);

-- Recreate function with proper parameter naming
CREATE OR REPLACE FUNCTION admin_delete_user(p_user_id uuid)
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
  WHERE id = p_user_id;

  -- Prevent deleting protected admin
  IF target_email = 'claiverg@gmail.com' THEN
    RAISE EXCEPTION 'Cannot delete protected administrator account';
  END IF;

  -- Delete user's bets
  DELETE FROM bets WHERE user_id = p_user_id;
  
  -- Delete user's betting houses and related transactions (cascade will handle transactions)
  DELETE FROM betting_houses WHERE user_id = p_user_id;
  
  -- Delete user's earnings
  DELETE FROM earnings WHERE user_id = p_user_id;
  
  -- Delete user from auth.users
  DELETE FROM auth.users WHERE id = p_user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION admin_delete_user(uuid) TO authenticated;