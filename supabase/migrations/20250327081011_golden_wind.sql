/*
  # Fix set_user_status function overloading issue
  
  1. Changes
    - Drop existing set_user_status functions
    - Create single function that handles both regular and temporary status
*/

-- Drop existing functions
DROP FUNCTION IF EXISTS set_user_status(uuid, text);
DROP FUNCTION IF EXISTS set_user_status(uuid, text, integer);

-- Create single function that handles both cases
CREATE OR REPLACE FUNCTION set_user_status(
  target_user_id uuid, 
  status text,
  access_days integer DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_email text;
  executing_user_email text;
  start_date timestamp;
  end_date timestamp;
  new_metadata jsonb;
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only administrators can modify user status';
  END IF;

  IF status NOT IN ('active', 'suspended', 'temporary') THEN
    RAISE EXCEPTION 'Invalid status. Must be either active, suspended, or temporary';
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

  -- Initialize new metadata with existing data
  SELECT COALESCE(raw_user_meta_data, '{}'::jsonb) INTO new_metadata
  FROM auth.users
  WHERE id = target_user_id;

  -- Remove existing status-related fields
  new_metadata = new_metadata - 'status' - 'access_start' - 'access_end';

  -- Handle temporary status
  IF status = 'temporary' THEN
    IF access_days IS NULL THEN
      RAISE EXCEPTION 'Access days must be specified for temporary status';
    END IF;
    
    start_date := CURRENT_TIMESTAMP;
    end_date := start_date + (access_days || ' days')::interval;
    
    new_metadata = new_metadata || jsonb_build_object(
      'status', status,
      'access_start', start_date::text,
      'access_end', end_date::text
    );
  ELSE
    new_metadata = new_metadata || jsonb_build_object('status', status);
  END IF;

  -- Update the user's metadata
  UPDATE auth.users
  SET raw_user_meta_data = new_metadata
  WHERE id = target_user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION set_user_status(uuid, text, integer) TO authenticated;