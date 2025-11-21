/*
  # Add Period Configuration to User Preferences

  ## Overview
  Adds period filter configuration fields to the user_preferences table to persist
  Dashboard period settings (General, Current Month, Last 30 Days, or Specific Month).

  ## Changes

  1. Modifications to `user_preferences` table:
    - Add `period_type` column (text) - Type of period filter: 'general', 'current_month', 'last_30', 'specific_month'
    - Add `period_month` column (integer) - Month number (1-12) for specific month filter
    - Add `period_year` column (integer) - Year for specific month filter

  2. Data Integrity:
    - Add check constraint to ensure period_type has valid values
    - Add check constraint to ensure period_month is between 1-12 when specified
    - Add check constraint to ensure period_year is reasonable when specified
    - Set default value 'general' for existing users

  ## Security
  - No changes to RLS policies (existing policies cover new columns)
*/

-- Add period configuration columns to user_preferences
DO $$
BEGIN
  -- Add period_type column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_preferences' AND column_name = 'period_type'
  ) THEN
    ALTER TABLE user_preferences
    ADD COLUMN period_type text DEFAULT 'general' NOT NULL
    CHECK (period_type IN ('general', 'current_month', 'last_30', 'specific_month'));
  END IF;

  -- Add period_month column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_preferences' AND column_name = 'period_month'
  ) THEN
    ALTER TABLE user_preferences
    ADD COLUMN period_month integer
    CHECK (period_month IS NULL OR (period_month >= 1 AND period_month <= 12));
  END IF;

  -- Add period_year column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_preferences' AND column_name = 'period_year'
  ) THEN
    ALTER TABLE user_preferences
    ADD COLUMN period_year integer
    CHECK (period_year IS NULL OR (period_year >= 2020 AND period_year <= 2100));
  END IF;
END $$;

-- Update existing get_user_preferences function to include new fields
CREATE OR REPLACE FUNCTION get_user_preferences()
RETURNS TABLE (
  dashboard_days_filter integer,
  period_type text,
  period_month integer,
  period_year integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert default preferences if they don't exist
  INSERT INTO user_preferences (user_id, dashboard_days_filter, period_type)
  VALUES (auth.uid(), 7, 'general')
  ON CONFLICT (user_id) DO NOTHING;

  -- Return user preferences
  RETURN QUERY
  SELECT
    up.dashboard_days_filter,
    up.period_type,
    up.period_month,
    up.period_year
  FROM user_preferences up
  WHERE up.user_id = auth.uid();
END;
$$;

-- Create function to update period configuration
CREATE OR REPLACE FUNCTION update_period_config(
  p_type text,
  p_month integer DEFAULT NULL,
  p_year integer DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate period type
  IF p_type NOT IN ('general', 'current_month', 'last_30', 'specific_month') THEN
    RAISE EXCEPTION 'Invalid period type. Must be general, current_month, last_30, or specific_month';
  END IF;

  -- Validate specific month parameters
  IF p_type = 'specific_month' THEN
    IF p_month IS NULL OR p_year IS NULL THEN
      RAISE EXCEPTION 'Month and year are required for specific_month type';
    END IF;

    IF p_month < 1 OR p_month > 12 THEN
      RAISE EXCEPTION 'Invalid month. Must be between 1 and 12';
    END IF;

    IF p_year < 2020 OR p_year > 2100 THEN
      RAISE EXCEPTION 'Invalid year. Must be between 2020 and 2100';
    END IF;
  END IF;

  -- Insert or update user preferences
  INSERT INTO user_preferences (
    user_id,
    period_type,
    period_month,
    period_year,
    updated_at
  )
  VALUES (
    auth.uid(),
    p_type,
    p_month,
    p_year,
    now()
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    period_type = EXCLUDED.period_type,
    period_month = EXCLUDED.period_month,
    period_year = EXCLUDED.period_year,
    updated_at = now();
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION update_period_config(text, integer, integer) TO authenticated;
