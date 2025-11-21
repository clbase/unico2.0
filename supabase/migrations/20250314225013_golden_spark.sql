/*
  # Remove user from allowed emails

  1. Changes
    - Remove specific email from allowed_emails table
*/

DELETE FROM allowed_emails 
WHERE email = 'paulopholipyparna@gmail.com';