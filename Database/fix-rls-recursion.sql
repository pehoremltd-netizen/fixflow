-- Fix infinite RLS recursion on profiles table
-- The old policy: SELECT organization_id FROM profiles WHERE id = auth.uid()
-- This caused infinite recursion because it queried profiles inside a policy ON profiles.
-- Fix: use a SECURITY DEFINER function that runs as the table owner (bypasses RLS).

-- 1. Create a helper function that bypasses RLS
CREATE OR REPLACE FUNCTION public.get_current_user_org_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid();
$$;

-- 2. Fix profiles policy
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON profiles;
CREATE POLICY "Users can view profiles in their organization"
  ON profiles FOR SELECT
  USING (organization_id = public.get_current_user_org_id());

-- 3. Fix organizations policy
DROP POLICY IF EXISTS "Users can view their own organization data" ON organizations;
CREATE POLICY "Users can view their own organization data"
  ON organizations FOR SELECT
  USING (id = public.get_current_user_org_id());

-- 4. Fix sites policy (already uses profiles subquery, update to use helper)
DROP POLICY IF EXISTS "Users can view sites in their organization" ON sites;
CREATE POLICY "Users can view sites in their organization"
  ON sites FOR SELECT
  USING (organization_id = public.get_current_user_org_id());

-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- Then run: npm run seed (from backend/)
