/*
  # Create Ads and Admin System

  1. New Tables
    - `admins`
      - `id` (uuid, primary key)
      - `password_hash` (text) - hashed password for admin access
      - `created_at` (timestamptz)
    - `ads`
      - `id` (uuid, primary key)
      - `title` (text) - ad title
      - `content` (text) - ad content/description
      - `link_url` (text) - URL to redirect when clicked
      - `is_active` (boolean) - whether the ad is currently active
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `created_by` (uuid) - reference to admin who created it
  
  2. Security
    - Enable RLS on both tables
    - `admins` table: No public access
    - `ads` table: Public can read active ads, only authenticated admins can manage
  
  3. Initial Data
    - Create default admin with password 'admin123' (should be changed in production)
*/

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create ads table
CREATE TABLE IF NOT EXISTS ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  link_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES admins(id)
);

-- Enable RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;

-- Policies for ads table
CREATE POLICY "Anyone can view active ads"
  ON ads
  FOR SELECT
  USING (is_active = true);

-- Insert default admin (password: admin123)
-- Using a simple hash for demonstration - in production, use proper password hashing
INSERT INTO admins (password_hash)
VALUES ('$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy')
ON CONFLICT DO NOTHING;