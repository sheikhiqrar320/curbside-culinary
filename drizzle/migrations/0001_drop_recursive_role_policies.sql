DROP POLICY IF EXISTS "admins read all roles" ON public.user_roles;
DROP POLICY IF EXISTS "admins delete roles" ON public.user_roles;
DROP POLICY IF EXISTS "admins insert roles" ON public.user_roles;
CREATE POLICY "admins insert roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));