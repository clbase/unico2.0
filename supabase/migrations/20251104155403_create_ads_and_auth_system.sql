/*
  # Create Ads and Authentication System

  ## 1. New Tables
    - `ads`
      - `id` (uuid, primary key)
      - `title` (text) - Ad title
      - `content` (text) - Ad content/description
      - `link_url` (text, nullable) - Optional URL link
      - `image_url` (text, nullable) - Optional image URL
      - `display_duration_seconds` (integer) - Duration to show ad in carousel
      - `is_active` (boolean) - Whether ad is active
      - `created_by` (uuid, nullable) - Admin who created it
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `whatsapp_banner_settings`
      - `id` (uuid, primary key)
      - `title` (text) - Banner title
      - `link_url` (text) - WhatsApp group link
      - `is_active` (boolean) - Whether banner is active
      - `updated_by` (uuid, nullable) - Admin who last updated it
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  ## 2. Security
    - Enable RLS on both tables
    - Ads table policies:
      - Anyone can read active ads
      - Only authenticated users can create/update/delete ads
    - WhatsApp banner policies:
      - Anyone can read active banner settings
      - Only authenticated users can update settings
*/

-- Create ads table
CREATE TABLE IF NOT EXISTS ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  link_url text,
  image_url text,
  display_duration_seconds integer NOT NULL DEFAULT 10,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create whatsapp_banner_settings table
CREATE TABLE IF NOT EXISTS whatsapp_banner_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  link_url text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  updated_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_banner_settings ENABLE ROW LEVEL SECURITY;

-- Ads policies
CREATE POLICY "Anyone can read active ads"
  ON ads FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can read all ads"
  ON ads FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create ads"
  ON ads FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update ads"
  ON ads FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete ads"
  ON ads FOR DELETE
  TO authenticated
  USING (true);

-- WhatsApp banner policies
CREATE POLICY "Anyone can read active banner settings"
  ON whatsapp_banner_settings FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can read all banner settings"
  ON whatsapp_banner_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update banner settings"
  ON whatsapp_banner_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert banner settings"
  ON whatsapp_banner_settings FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Insert default WhatsApp banner settings
INSERT INTO whatsapp_banner_settings (title, link_url, is_active)
VALUES (
  'Grupo de entradas free - Surebet',
  'https://chat.whatsapp.com/BeHEec7GcYZCx3qz883xRt',
  true
)
ON CONFLICT DO NOTHING;
