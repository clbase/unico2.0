/*
  # Add user categories system
  
  1. Changes
    - Add category field to user metadata
    - Create function to update user categories
    - Update allowed_emails table to support categories
*/

-- Add category column to allowed_emails table
ALTER TABLE allowed_emails 
ADD COLUMN IF NOT EXISTS category text DEFAULT 'assinatura_planilha' 
CHECK (category IN ('administradores', 'membros_vip', 'assinatura_planilha'));

-- Function to set user category
CREATE OR REPLACE FUNCTION set_user_category(target_user_id uuid, user_category text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only administrators can modify user categories';
  END IF;

  IF user_category NOT IN ('administradores', 'membros_vip', 'assinatura_planilha') THEN
    RAISE EXCEPTION 'Invalid category. Must be administradores, membros_vip, or assinatura_planilha';
  END IF;

  -- Update the user's category
  UPDATE auth.users
  SET raw_user_meta_data = 
    CASE 
      WHEN raw_user_meta_data IS NULL THEN 
        jsonb_build_object('category', user_category)
      ELSE 
        raw_user_meta_data || jsonb_build_object('category', user_category)
    END
  WHERE id = target_user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION set_user_category(uuid, text) TO authenticated;

-- Update existing users to have default category
UPDATE auth.users
SET raw_user_meta_data = 
  CASE 
    WHEN raw_user_meta_data IS NULL THEN 
      jsonb_build_object('category', 'assinatura_planilha')
    WHEN raw_user_meta_data->>'category' IS NULL THEN
      raw_user_meta_data || jsonb_build_object('category', 'assinatura_planilha')
    ELSE 
      raw_user_meta_data
  END
WHERE raw_user_meta_data->>'category' IS NULL OR raw_user_meta_data IS NULL;

-- Set admin users to administradores category
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('category', 'administradores')
WHERE raw_user_meta_data->>'is_admin' = 'true';