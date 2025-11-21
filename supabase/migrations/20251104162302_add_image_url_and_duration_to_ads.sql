/*
  # Add image_url and display_duration_seconds to ads table

  1. Changes
    - Add `image_url` column to store image URLs for ads (optional)
    - Add `display_duration_seconds` column to control how long each ad displays in the carousel (default: 10 seconds)
  
  2. Details
    - `image_url`: text, nullable - URL of an image to display with the ad
    - `display_duration_seconds`: integer, default 10 - Duration in seconds to display the ad in the carousel
*/

-- Add image_url column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ads' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE ads ADD COLUMN image_url text;
  END IF;
END $$;

-- Add display_duration_seconds column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ads' AND column_name = 'display_duration_seconds'
  ) THEN
    ALTER TABLE ads ADD COLUMN display_duration_seconds integer DEFAULT 10 NOT NULL;
  END IF;
END $$;