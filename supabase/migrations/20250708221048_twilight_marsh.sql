/*
  # Add login preview setting to navigation settings

  1. Changes
    - Add login_preview setting to navigation_settings table
    - Set default value to false (disabled)
*/

-- Insert login preview setting
INSERT INTO navigation_settings (setting_key, is_enabled) VALUES
  ('login_preview', false)
ON CONFLICT (setting_key) DO NOTHING;