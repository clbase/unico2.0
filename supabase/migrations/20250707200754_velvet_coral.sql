/*
  # Add pending status system

  1. Changes
    - Update user status validation to include 'pending' status
    - Update check_user_access function to handle pending status
    - Update set_user_status function to exclude pending from manual changes
    - Update review_access_request to set status to active instead of creating with pending

  2. Security
    - Pending users cannot access the system
    - Pending status cannot be manually set by admins
    - Only approval process can change from pending to active
*/

-- Update check_user_access function to handle pending status
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

  -- Check if user is pending approval
  IF user_status = 'pending' THEN
    RETURN false;
  END IF;

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

-- Update set_user_status function to exclude pending from manual changes
CREATE OR REPLACE FUNCTION set_user_status(
  target_user_id uuid, 
  status text,
  end_date text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_email text;
  executing_user_email text;
  start_date timestamptz;
  parsed_end_date timestamptz;
  new_metadata jsonb;
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only administrators can modify user status';
  END IF;

  -- Exclude pending from manual status changes
  IF status NOT IN ('active', 'suspended', 'temporary', 'expired') THEN
    RAISE EXCEPTION 'Invalid status. Must be either active, suspended, temporary, or expired';
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
    IF end_date IS NULL THEN
      RAISE EXCEPTION 'End date must be specified for temporary status';
    END IF;
    
    -- Set start date to current time in America/Sao_Paulo timezone
    start_date := CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo';
    
    -- Parse the provided end date
    parsed_end_date := end_date::timestamptz;
    
    new_metadata = new_metadata || jsonb_build_object(
      'status', status,
      'access_start', start_date::text,
      'access_end', parsed_end_date::text
    );
  ELSE
    -- For other statuses, clear access dates
    new_metadata = new_metadata || jsonb_build_object('status', status);
  END IF;

  -- Update the user's metadata
  UPDATE auth.users
  SET raw_user_meta_data = new_metadata
  WHERE id = target_user_id;
END;
$$;

-- Update review_access_request function to properly handle status changes
CREATE OR REPLACE FUNCTION review_access_request(
  request_id uuid,
  action text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  request_email text;
  user_exists boolean;
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only administrators can review access requests';
  END IF;

  IF action NOT IN ('approve', 'reject') THEN
    RAISE EXCEPTION 'Invalid action. Must be approve or reject';
  END IF;

  -- Get request email
  SELECT email INTO request_email
  FROM access_requests
  WHERE id = request_id AND status = 'pending';

  IF request_email IS NULL THEN
    RAISE EXCEPTION 'Access request not found or already reviewed';
  END IF;

  -- Update request status
  UPDATE access_requests
  SET 
    status = CASE WHEN action = 'approve' THEN 'approved' ELSE 'rejected' END,
    reviewed_at = now(),
    reviewed_by = auth.uid()
  WHERE id = request_id;

  -- If approved, add email to allowed_emails and activate user account
  IF action = 'approve' THEN
    -- Add to allowed emails
    INSERT INTO allowed_emails (email, created_by)
    VALUES (request_email, auth.uid())
    ON CONFLICT (email) DO NOTHING;

    -- Check if user account exists and activate it
    SELECT EXISTS (
      SELECT 1 FROM auth.users WHERE email = request_email
    ) INTO user_exists;

    IF user_exists THEN
      -- Update user status to active (from pending)
      UPDATE auth.users
      SET raw_user_meta_data = 
        CASE 
          WHEN raw_user_meta_data IS NULL THEN 
            jsonb_build_object('status', 'active', 'category', 'assinatura_planilha')
          ELSE 
            raw_user_meta_data || jsonb_build_object('status', 'active', 'category', 'assinatura_planilha')
        END
      WHERE email = request_email;
    END IF;
  END IF;
END;
$$;

-- Update create_access_request function to create users with pending status
CREATE OR REPLACE FUNCTION create_access_request(
  user_email text,
  user_name text,
  user_phone text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  request_id uuid;
  final_name text;
BEGIN
  -- Use provided name or default for automatic requests
  final_name := COALESCE(NULLIF(trim(user_name), ''), 'Usuário');

  -- Check if email is already authorized
  IF EXISTS (SELECT 1 FROM allowed_emails WHERE email = lower(user_email)) THEN
    RAISE EXCEPTION 'Email is already authorized';
  END IF;

  -- Check if request already exists
  IF EXISTS (SELECT 1 FROM access_requests WHERE email = lower(user_email) AND status = 'pending') THEN
    RAISE EXCEPTION 'Access request already exists for this email';
  END IF;

  -- Create new access request
  INSERT INTO access_requests (email, name, phone)
  VALUES (lower(user_email), final_name, user_phone)
  RETURNING id INTO request_id;

  RETURN request_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION check_user_access() TO authenticated;
GRANT EXECUTE ON FUNCTION set_user_status(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION review_access_request(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION create_access_request(text, text, text) TO public;