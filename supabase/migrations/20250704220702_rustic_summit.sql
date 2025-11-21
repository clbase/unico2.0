/*
  # Add navigation settings table

  1. New Tables
    - `navigation_settings`
      - `id` (uuid, primary key)
      - `setting_key` (text, unique)
      - `is_enabled` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `navigation_settings` table
    - Add policies for admin access only

  3. Initial Data
    - Insert default navigation settings
*/

CREATE TABLE IF NOT EXISTS navigation_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  is_enabled boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE navigation_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can manage navigation settings
CREATE POLICY "Admins can manage navigation settings"
  ON navigation_settings
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Anyone can read navigation settings (for UI display)
CREATE POLICY "Anyone can read navigation settings"
  ON navigation_settings
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert default navigation settings
INSERT INTO navigation_settings (setting_key, is_enabled) VALUES
  ('calculator', true),
  ('earnings', true),
  ('bankroll', true)
ON CONFLICT (setting_key) DO NOTHING;

-- Function to update navigation setting
CREATE OR REPLACE FUNCTION update_navigation_setting(key text, enabled boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only administrators can update navigation settings';
  END IF;

  UPDATE navigation_settings
  SET is_enabled = enabled, updated_at = now()
  WHERE setting_key = key;
END;
$$;

-- Function to get all navigation settings
CREATE OR REPLACE FUNCTION get_navigation_settings()
RETURNS TABLE (
  setting_key text,
  is_enabled boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT ns.setting_key, ns.is_enabled
  FROM navigation_settings ns
  ORDER BY ns.setting_key;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION update_navigation_setting(text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION get_navigation_settings() TO authenticated;