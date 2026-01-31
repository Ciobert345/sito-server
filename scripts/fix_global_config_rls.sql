-- Abilita RLS sulla tabella (se non è già attivo)
ALTER TABLE public.global_config ENABLE ROW LEVEL SECURITY;

-- Rimuovi eventuali policy precedenti per evitare conflitti
DROP POLICY IF EXISTS "Enable read access for all users" ON public.global_config;
DROP POLICY IF EXISTS "Allow public read access to global_config" ON public.global_config;

-- Crea una policy che permette a chiunque (anonimi e loggati) di leggere la configurazione globale
CREATE POLICY "Enable read access for all users"
ON public.global_config
FOR SELECT
TO anon, authenticated
USING (true);

-- Verifica che la policy sia stata applicata
SELECT * FROM pg_policies WHERE tablename = 'global_config';
