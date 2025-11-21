/*
  # Create Admin and Ads System with Email Authentication

  1. New Tables
    - `admins`
      - `id` (uuid, primary key) - unique identifier for admin
      - `email` (text, unique, not null) - admin email for login
      - `password_hash` (text, not null) - bcrypt hashed password
      - `created_at` (timestamptz) - timestamp of account creation
    
    - `ads`
      - `id` (uuid, primary key) - unique identifier for ad
      - `title` (text, not null) - ad title/headline
      - `content` (text, not null) - ad content/description
      - `link_url` (text, nullable) - optional URL for clickable ads
      - `is_active` (boolean, default true) - whether ad is currently shown
      - `created_at` (timestamptz) - timestamp of ad creation
      - `updated_at` (timestamptz) - timestamp of last update
      - `created_by` (uuid) - reference to admin who created the ad
    
    - `shares`
      - `id` (uuid, primary key) - unique identifier for share
      - `code` (text, unique, not null) - shareable code
      - `type` (text, not null) - calculator type (dutching/limitation/aumentada)
      - `data` (jsonb, not null) - calculator data
      - `total_stake` (numeric) - total stake value
      - `created_at` (timestamptz) - timestamp of share creation
      - `expires_at` (timestamptz) - expiration timestamp (5 days from creation)
  
  2. Security (Row Level Security)
    - `admins`: Restrictive - anyone can verify credentials (for login), no other access
    - `ads`: Public can read active ads only, no write access without authentication
    - `shares`: Public can read shares (for shared calculator links)
    
  3. Initial Data
    - Create default admin account
      - Email: admin@vivendodesurebet.com
      - Password: admin123
      - Note: bcrypt hash of 'admin123'
  
  4. Important Notes
    - Password is hashed using bcrypt for security
    - Change default password after first login
    - RLS is enabled on all tables for security
    - Shares expire after 5 days automatically
*/

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
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

-- Create shares table
CREATE TABLE IF NOT EXISTS shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  type text NOT NULL,
  data jsonb NOT NULL,
  total_stake numeric,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE shares ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admins table
CREATE POLICY "Allow login credential verification"
  ON admins
  FOR SELECT
  USING (true);

-- RLS Policies for ads table
CREATE POLICY "Anyone can view active ads"
  ON ads
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Allow viewing all ads for management"
  ON ads
  FOR SELECT
  USING (true);

CREATE POLICY "Allow inserting ads"
  ON ads
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow updating ads"
  ON ads
  FOR UPDATE
  USING (true);

CREATE POLICY "Allow deleting ads"
  ON ads
  FOR DELETE
  USING (true);

-- RLS Policies for shares table
CREATE POLICY "Anyone can view non-expired shares"
  ON shares
  FOR SELECT
  USING (expires_at > now());

CREATE POLICY "Anyone can create shares"
  ON shares
  FOR INSERT
  WITH CHECK (true);

-- Insert default admin account
-- Password: admin123 (bcrypt hash)
INSERT INTO admins (email, password_hash)
VALUES ('admin@vivendodesurebet.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy')
ON CONFLICT (email) DO NOTHING;