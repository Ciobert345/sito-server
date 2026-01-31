-- SQL MIGRATION: ENSURE MASTER MCSS ROWS EXIST
-- Execute this in the Supabase SQL Editor

-- Ensure the 'admin' and 'standard' rows exist in mcss_configs
INSERT INTO mcss_configs (id, mcss_api_key, description)
VALUES 
('admin', '', 'Master Admin API Key'),
('standard', '', 'Master Standard API Key')
ON CONFLICT (id) DO NOTHING;

-- Verification
SELECT * FROM mcss_configs WHERE id IN ('admin', 'standard');
