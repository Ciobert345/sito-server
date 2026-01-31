-- Abilita RLS sulle tabelle
ALTER TABLE public.roadmap_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Rimuovi policy precedenti
DROP POLICY IF EXISTS "Allow public read access to roadmap_items" ON public.roadmap_items;
DROP POLICY IF EXISTS "Allow public read access to notifications" ON public.notifications;

-- Roadmap Items: Public Read
CREATE POLICY "Allow public read access to roadmap_items"
ON public.roadmap_items
FOR SELECT
TO anon, authenticated
USING (true);

-- Notifications: Public Read
CREATE POLICY "Allow public read access to notifications"
ON public.notifications
FOR SELECT
TO anon, authenticated
USING (true);

-- Verifica
SELECT tablename, policyname, roles, cmd, qual FROM pg_policies WHERE tablename IN ('roadmap_items', 'notifications');
