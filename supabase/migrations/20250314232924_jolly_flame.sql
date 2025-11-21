/*
  # Set initial admin user

  1. Changes
    - Set admin status for specified email
*/

-- Set initial admin user
UPDATE auth.users
SET raw_user_meta_data = jsonb_build_object('is_admin', 'true')
WHERE email = 'claiverg@gmail.com';