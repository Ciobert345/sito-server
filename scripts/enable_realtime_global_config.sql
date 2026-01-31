-- Enable Supabase Realtime for global_config table
-- Run this in the Supabase SQL Editor

-- First, ensure the table is part of the publication for realtime
ALTER PUBLICATION supabase_realtime ADD TABLE global_config;

-- If the above gives an error that the table is already added, that's fine.
-- Alternatively, you can check and set replica identity:
ALTER TABLE global_config REPLICA IDENTITY FULL;

-- Note: After running this, you may need to:
-- 1. Go to Database > Replication in Supabase Dashboard
-- 2. Ensure 'global_config' table has realtime enabled
-- 3. The subscription should start receiving events
