/*
  # Update access request approval to activate accounts
  
  1. Changes
    - Update review_access_request function to activate user accounts when approved
    - Add function to check if user account exists and update status
*/

-- Update review_access_request function to activate accounts
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
      -- Update user status to active
      UPDATE auth.users
      SET raw_user_meta_data = 
        CASE 
          WHEN raw_user_meta_data IS NULL THEN 
            jsonb_build_object('status', 'active')
          ELSE 
            raw_user_meta_data || jsonb_build_object('status', 'active')
        END
      WHERE email = request_email;
    END IF;
  END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION review_access_request(uuid, text) TO authenticated;