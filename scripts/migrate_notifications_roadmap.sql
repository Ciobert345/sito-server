-- SQL MIGRATION: NOTIFICATIONS & ROADMAP
-- Execute this in the Supabase SQL Editor

-- ==========================================
-- 1. NOTIFICATIONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    enabled BOOLEAN DEFAULT true,
    title TEXT NOT NULL,
    subtitle TEXT,
    message TEXT,
    icon TEXT DEFAULT 'notification',
    style TEXT DEFAULT 'banner-blue',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Read Access: All authenticated users
DROP POLICY IF EXISTS "Allow authenticated users to read notifications" ON notifications;
CREATE POLICY "Allow authenticated users to read notifications" 
ON notifications FOR SELECT TO authenticated USING (true);

-- Admin Access: CRUD
DROP POLICY IF EXISTS "Allow admins to manage notifications" ON notifications;
CREATE POLICY "Allow admins to manage notifications" 
ON notifications FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true))
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- Initial Data Migration (from infoBanners in config.json)
INSERT INTO notifications (id, enabled, title, subtitle, message, icon, style)
VALUES 
('banner1', true, '🚨NEW WIKI🚨', '', 'A new wiki has been created; check it out on the ''updates'' page!', 'notification', 'banner-blue')
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 2. ROADMAP_ITEMS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS roadmap_items (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT,
    priority TEXT,
    "column" TEXT NOT NULL, -- backlog, nextup, inprogress, done
    progress INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE roadmap_items ENABLE ROW LEVEL SECURITY;

-- Read Access: All authenticated users
DROP POLICY IF EXISTS "Allow authenticated users to read roadmap_items" ON roadmap_items;
CREATE POLICY "Allow authenticated users to read roadmap_items" 
ON roadmap_items FOR SELECT TO authenticated USING (true);

-- Admin Access: CRUD
DROP POLICY IF EXISTS "Allow admins to manage roadmap_items" ON roadmap_items;
CREATE POLICY "Allow admins to manage roadmap_items" 
ON roadmap_items FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true))
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- Initial Data Migration (from roadmap items in config.json)
INSERT INTO roadmap_items (id, title, type, priority, "column", progress)
VALUES 
('13', 'December Update', 'nextup', 'High', 'inprogress', 0),
('10', 'Crash when leaving server', 'Bugfix', 'High', 'done', 100),
('11', 'Crash when goblin trader finishes eating', 'Bugfix', 'High', 'backlog', 0),
('8', 'Thallium Anvil bug fix', 'Bugfix', 'High', 'backlog', 0),
('9', 'Adding more quests', 'Improvement', 'Low', 'backlog', 0)
ON CONFLICT (id) DO NOTHING;
