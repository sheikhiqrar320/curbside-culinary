CREATE POLICY "admins upload media" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'media' AND EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));

CREATE POLICY "admins update media" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'media' AND EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));

CREATE POLICY "admins delete media" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'media' AND EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));

CREATE POLICY "read media objects" ON storage.objects
FOR SELECT TO anon, authenticated
USING (bucket_id = 'media');