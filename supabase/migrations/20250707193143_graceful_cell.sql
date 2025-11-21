/*
  # Improve access request functionality
  
  1. Changes
    - Update create_access_request function to handle automatic requests
    - Allow default name for automatic signup requests
    - Improve error handling
*/

-- Update create_access_request function
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

-- Grant execute permission to public (for signup flow)
GRANT EXECUTE ON FUNCTION create_access_request(text, text, text) TO public;