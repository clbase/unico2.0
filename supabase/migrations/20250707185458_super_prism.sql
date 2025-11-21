/*
  # Add access requests system

  1. New Tables
    - `access_requests`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `name` (text)
      - `phone` (text)
      - `status` (text: 'pending', 'approved', 'rejected')
      - `created_at` (timestamp)
      - `reviewed_at` (timestamp, nullable)
      - `reviewed_by` (uuid, references auth.users, nullable)

  2. Security
    - Enable RLS on `access_requests` table
    - Add policies for public insert and admin management

  3. Functions
    - Function to create access request
    - Function to approve/reject access request
    - Function to get pending requests count
*/

CREATE TABLE IF NOT EXISTS access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  phone text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES auth.users,
  CONSTRAINT email_lowercase CHECK (email = lower(email))
);

ALTER TABLE access_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can create access requests
CREATE POLICY "Anyone can create access requests"
  ON access_requests
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Only admins can view and manage access requests
CREATE POLICY "Admins can manage access requests"
  ON access_requests
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Function to create access request
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
BEGIN
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
  VALUES (lower(user_email), user_name, user_phone)
  RETURNING id INTO request_id;

  RETURN request_id;
END;
$$;

-- Function to approve/reject access request
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

  -- If approved, add email to allowed_emails
  IF action = 'approve' THEN
    INSERT INTO allowed_emails (email, created_by)
    VALUES (request_email, auth.uid())
    ON CONFLICT (email) DO NOTHING;
  END IF;
END;
$$;

-- Function to get pending requests count
CREATE OR REPLACE FUNCTION get_pending_requests_count()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RETURN 0;
  END IF;

  RETURN (
    SELECT COUNT(*)::integer
    FROM access_requests
    WHERE status = 'pending'
  );
END;
$$;

-- Function to list access requests
CREATE OR REPLACE FUNCTION list_access_requests()
RETURNS TABLE (
  id uuid,
  email text,
  name text,
  phone text,
  status text,
  created_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by_email text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only administrators can list access requests';
  END IF;

  RETURN QUERY
  SELECT 
    ar.id,
    ar.email,
    ar.name,
    ar.phone,
    ar.status,
    ar.created_at,
    ar.reviewed_at,
    u.email::text as reviewed_by_email
  FROM access_requests ar
  LEFT JOIN auth.users u ON ar.reviewed_by = u.id
  ORDER BY 
    CASE WHEN ar.status = 'pending' THEN 0 ELSE 1 END,
    ar.created_at DESC;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION create_access_request(text, text, text) TO public;
GRANT EXECUTE ON FUNCTION review_access_request(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_pending_requests_count() TO authenticated;
GRANT EXECUTE ON FUNCTION list_access_requests() TO authenticated;