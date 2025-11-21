/*
  # Add user preferences table

  1. New Tables
    - `user_preferences`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `dashboard_days_filter` (integer, default 7)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `user_preferences` table
    - Add policies for CRUD operations
*/

CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL UNIQUE,
  dashboard_days_filter integer DEFAULT 7 CHECK (dashboard_days_filter IN (3, 5, 7)),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own preferences"
  ON user_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own preferences"
  ON user_preferences
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON user_preferences
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to get or create user preferences
CREATE OR REPLACE FUNCTION get_user_preferences()
RETURNS TABLE (
  dashboard_days_filter integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert default preferences if they don't exist
  INSERT INTO user_preferences (user_id, dashboard_days_filter)
  VALUES (auth.uid(), 7)
  ON CONFLICT (user_id) DO NOTHING;

  -- Return user preferences
  RETURN QUERY
  SELECT up.dashboard_days_filter
  FROM user_preferences up
  WHERE up.user_id = auth.uid();
END;
$$;

-- Function to update user preferences
CREATE OR REPLACE FUNCTION update_user_preferences(days_filter integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF days_filter NOT IN (3, 5, 7) THEN
    RAISE EXCEPTION 'Invalid days filter. Must be 3, 5, or 7';
  END IF;

  INSERT INTO user_preferences (user_id, dashboard_days_filter, updated_at)
  VALUES (auth.uid(), days_filter, now())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    dashboard_days_filter = EXCLUDED.dashboard_days_filter,
    updated_at = now();
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_user_preferences() TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_preferences(integer) TO authenticated;