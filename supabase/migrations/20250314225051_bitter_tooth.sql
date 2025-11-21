/*
  # Add delete user function

  1. Changes
    - Add PostgreSQL function to delete user data and account
*/

CREATE OR REPLACE FUNCTION delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete user's bets
  DELETE FROM bets WHERE user_id = auth.uid();
  
  -- Delete user from auth.users
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;