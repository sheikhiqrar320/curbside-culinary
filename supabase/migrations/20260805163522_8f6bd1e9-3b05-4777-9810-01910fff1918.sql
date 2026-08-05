ALTER TABLE public.dishes
  ADD COLUMN IF NOT EXISTS discount integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS stock integer NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS visible boolean NOT NULL DEFAULT true;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS landmark text,
  ADD COLUMN IF NOT EXISTS pincode text,
  ADD COLUMN IF NOT EXISTS admin_notes text;

DROP POLICY IF EXISTS "public reads dishes of approved restaurants" ON public.dishes;
CREATE POLICY "public reads visible dishes of approved restaurants"
ON public.dishes FOR SELECT TO anon, authenticated
USING (visible = true AND EXISTS (
  SELECT 1 FROM public.restaurants r
  WHERE r.id = dishes.restaurant_id AND r.status = 'approved'::approval_status
));