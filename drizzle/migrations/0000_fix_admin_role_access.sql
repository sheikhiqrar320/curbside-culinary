GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
DROP POLICY IF EXISTS "admins read all" ON public.user_roles;
DROP POLICY IF EXISTS "admins delete" ON public.user_roles;
CREATE POLICY "admins read all" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins delete" ON public.user_roles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT ON public.dishes, public.restaurants, public.store_settings TO anon;