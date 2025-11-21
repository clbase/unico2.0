/*
  # Protect main admin from status changes
  
  1. Changes
    - Modify set_user_status function to prevent status changes for main admin
    - Add check to ensure only the main admin can modify their own status
*/

-- Drop existing function
DROP FUNCTION IF EXISTS set_user_status(uuid, text);

-- Recreate function with protection for main admin
CREATE OR REPLACE FUNCTION set_user_status(target_user_id uuid, status text)
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
    RAISE EXCEPTION 'Only administrators can modify user status';
  END IF;

  IF status NOT IN ('active', 'suspended') THEN
    RAISE EXCEPTION 'Invalid status. Must be either active or suspended';
  END IF;

  -- Get the email of the target user and executing user
  SELECT email INTO target_email
  FROM auth.users
  WHERE id = target_user_id;

  SELECT email INTO executing_user_email
  FROM auth.users
  WHERE id = auth.uid();

  -- Only allow claiverg@gmail.com to modify their own status
  IF target_email = 'claiverg@gmail.com' AND executing_user_email != 'claiverg@gmail.com' THEN
    RAISE EXCEPTION 'Only the main administrator can modify their own status';
  END IF;

  -- Update the user's status
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION set_user_status(uuid, text) TO authenticated;