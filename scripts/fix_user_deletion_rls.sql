-- SQL FIX: ENABLE USER DELETION FOR ADMINS
-- Execute this in the Supabase SQL Editor

-- 1. Allow Admins to delete rows from 'profiles'
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;
CREATE POLICY "Admins can delete profiles" 
ON profiles FOR DELETE 
USING (
  (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
);

-- 2. Optional: Ensure MCSS configs can also be deleted by admins if they are private (id is UUID)
DROP POLICY IF EXISTS "Admins can delete mcss_configs" ON mcss_configs;
CREATE POLICY "Admins can delete mcss_configs"
ON mcss_configs FOR DELETE
USING (
  (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
);

-- 3. Verification
-- No specific command, but this will allow the 'delete' action from the dashboard.
