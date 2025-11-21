/*
  # Add function to check user access status
  
  1. New Functions
    - check_user_access: Function to check if user has valid access
    - Returns false if user is suspended or expired
*/

CREATE OR REPLACE FUNCTION check_user_access()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_status text;
  access_end timestamptz;
BEGIN
  -- Get user status and access end date
  SELECT 
    raw_user_meta_data->>'status',
    (raw_user_meta_data->>'access_end')::timestamptz
  INTO user_status, access_end
  FROM auth.users
  WHERE id = auth.uid();

  -- Check if user is suspended
  IF user_status = 'suspended' THEN
    RETURN false;
  END IF;

  -- Check if user has temporary access that has expired
  IF user_status = 'temporary' AND access_end < CURRENT_TIMESTAMP THEN
    -- Update status to expired
    UPDATE auth.users
    SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('status', 'expired')
    WHERE id = auth.uid();
    RETURN false;
  END IF;

  -- Check if user is already marked as expired
  IF user_status = 'expired' THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$$;