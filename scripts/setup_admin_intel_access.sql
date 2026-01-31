-- DEFINITIVE SQL SCRIPT TO ENABLE INTEL MANAGEMENT FOR ADMINS
-- Execute this in the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Ensure RLS is enabled
ALTER TABLE intel_assets ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid conflicts (if any)
DROP POLICY IF EXISTS "Allow authenticated users to read intel_assets" ON intel_assets;
DROP POLICY IF EXISTS "Allow admins to insert intel_assets" ON intel_assets;
DROP POLICY IF EXISTS "Allow admins to update intel_assets" ON intel_assets;
DROP POLICY IF EXISTS "Allow admins to delete intel_assets" ON intel_assets;

-- 3. Policy for Reading (All authenticated users can see Intel)
CREATE POLICY "Allow authenticated users to read intel_assets"
ON intel_assets FOR SELECT
TO authenticated
USING (true);

-- 4. Policy for Inserting (Admins only)
CREATE POLICY "Allow admins to insert intel_assets"
ON intel_assets FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
);

-- 5. Policy for Updating (Admins only)
CREATE POLICY "Allow admins to update intel_assets"
ON intel_assets FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
);

-- 6. Policy for Deleting (Admins only)
CREATE POLICY "Allow admins to delete intel_assets"
ON intel_assets FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
);

-- VERIFICATION
-- Check if the policies are now active
SELECT policyname, cmd, roles FROM pg_policies WHERE tablename = 'intel_assets';
