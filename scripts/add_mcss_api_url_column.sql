-- Add mcss_api_url column to global_config if it doesn't exist
ALTER TABLE global_config ADD COLUMN IF NOT EXISTS mcss_api_url TEXT DEFAULT 'https://server-manfredonia.ddns.net:25560';

-- Update existing row
UPDATE global_config SET mcss_api_url = 'https://server-manfredonia.ddns.net:25560' WHERE id = 1;
