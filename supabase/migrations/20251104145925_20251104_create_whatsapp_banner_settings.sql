/*
  # Create WhatsApp Banner Settings Table

  1. New Tables
    - `whatsapp_banner_settings`
      - `id` (uuid, primary key)
      - `title` (text) - Banner title text
      - `link_url` (text) - WhatsApp group link URL
      - `is_active` (boolean) - Whether the banner is active
      - `updated_at` (timestamptz) - Last update timestamp
      - `updated_by` (uuid) - Admin user who made the update

  2. Security
    - Enable RLS on `whatsapp_banner_settings` table
    - Add policy for public read access
    - Add policy for authenticated admin write access
*/

CREATE TABLE IF NOT EXISTS whatsapp_banner_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT 'Grupo de entradas free - Surebet',
  link_url text NOT NULL DEFAULT 'https://chat.whatsapp.com/BeHEec7GcYZCx3qz883xRt',
  is_active boolean DEFAULT true,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

ALTER TABLE whatsapp_banner_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view banner settings"
  ON whatsapp_banner_settings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can update banner settings"
  ON whatsapp_banner_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert banner settings"
  ON whatsapp_banner_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

INSERT INTO whatsapp_banner_settings (title, link_url, is_active)
VALUES ('Grupo de entradas free - Surebet', 'https://chat.whatsapp.com/BeHEec7GcYZCx3qz883xRt', true)
ON CONFLICT DO NOTHING;