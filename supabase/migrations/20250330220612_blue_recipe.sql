/*
  # Remove password reset functionality
  
  1. Changes
    - Drop password reset related functions
    - Remove password change metadata from users
*/

-- Drop password reset functions
DROP FUNCTION IF EXISTS reset_user_password(uuid);
DROP FUNCTION IF EXISTS is_temporary_password();

-- Remove password change metadata from users
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data - 'needs_password_change' - 'temporary_password'
WHERE raw_user_meta_data ? 'needs_password_change' 
   OR raw_user_meta_data ? 'temporary_password';