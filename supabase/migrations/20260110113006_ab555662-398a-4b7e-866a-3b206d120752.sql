-- Drop the problematic admin SELECT policy that causes circular dependency
-- (It uses has_role() which queries user_roles, causing recursion during RLS evaluation)
DROP POLICY IF EXISTS "Admin can view all roles" ON public.user_roles;

-- The existing "Users can view own roles" policy (user_id = auth.uid()) is sufficient
-- because each user (including admins) can see their own roles, which is all that's needed
-- for the role context to correctly identify the user's role