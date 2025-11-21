/*
  # Add temporary status and expiration management
  
  1. Changes
    - Add temporary status option to user status check
    - Add access_start and access_end fields to user metadata
    - Update set_user_status function to handle temporary status
*/

-- Update set_user_status function to handle temporary status
CREATE OR REPLACE FUNCTION set_user_status(
  target_user_id uuid, 
  status text,
  access_days int DEFAULT NULL
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

  -- Handle temporary status
  IF status = 'temporary' THEN
    IF access_days IS NULL THEN
      RAISE EXCEPTION 'Access days must be specified for temporary status';
    END IF;
    
    start_date := CURRENT_TIMESTAMP;
    end_date := start_date + (access_days || ' days')::interval;
  END IF;

  -- Update the user's status and access dates if applicable
  UPDATE auth.users
  SET raw_user_meta_data = 
    CASE 
      WHEN raw_user_meta_data IS NULL THEN 
        jsonb_build_object(
          'status', status,
          'access_start', CASE WHEN status = 'temporary' THEN start_date::text ELSE NULL END,
          'access_end', CASE WHEN status = 'temporary' THEN end_date::text ELSE NULL END
        )
      ELSE 
        raw_user_meta_data || jsonb_build_object(
          'status', status,
          'access_start', CASE WHEN status = 'temporary' THEN start_date::text ELSE NULL END,
          'access_end', CASE WHEN status = 'temporary' THEN end_date::text ELSE NULL END
        )
    END
  WHERE id = target_user_id;
END;
$$;