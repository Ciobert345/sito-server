-- Migration script for Emergency and Terminal controls
-- Run this in the Supabase SQL Editor

-- Add new control columns to global_config
ALTER TABLE global_config 
ADD COLUMN IF NOT EXISTS is_emergency_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_terminal_enabled boolean DEFAULT true;

-- Update the existing row with default values
UPDATE global_config 
SET 
  is_emergency_enabled = false,
  is_terminal_enabled = true
WHERE id = 1;

-- Ensure RLS policies allow admins to update these fields
-- (Should already be covered by existing admin policies)
