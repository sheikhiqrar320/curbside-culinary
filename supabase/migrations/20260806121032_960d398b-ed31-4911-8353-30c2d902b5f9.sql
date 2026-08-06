CREATE TABLE public.store_settings (
  id boolean PRIMARY KEY DEFAULT true,
  store_name text NOT NULL DEFAULT 'Slider',
  tagline text NOT NULL DEFAULT 'Hot food, slid to your door.',
  shop_open boolean NOT NULL DEFAULT true,
  closed_title text NOT NULL DEFAULT 'The kitchen is resting',
  closed_reason text NOT NULL DEFAULT '',
  support_phone text NOT NULL DEFAULT '+91 80 4567 8900',
  support_email text NOT NULL DEFAULT 'support@slider.food',
  whatsapp text NOT NULL DEFAULT '',
  theme_primary text NOT NULL DEFAULT '18 82% 52%',
  theme_accent text NOT NULL DEFAULT '38 92% 55%',
  theme_background text NOT NULL DEFAULT '35 45% 97%',
  theme_mode text NOT NULL DEFAULT 'light',
  offer_active boolean NOT NULL DEFAULT false,
  offer_text text NOT NULL DEFAULT '',
  delivery_fee integer NOT NULL DEFAULT 39,
  free_delivery_enabled boolean NOT NULL DEFAULT true,
  free_delivery_above integer NOT NULL DEFAULT 599,
  tax_rate numeric NOT NULL DEFAULT 0.05,
  eta_min integer NOT NULL DEFAULT 30,
  eta_max integer NOT NULL DEFAULT 45,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT store_settings_singleton CHECK (id = true)
);

GRANT SELECT ON public.store_settings TO anon;
GRANT SELECT, INSERT, UPDATE ON public.store_settings TO authenticated;
GRANT ALL ON public.store_settings TO service_role;

ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public reads store settings"
  ON public.store_settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "admins update store settings"
  ON public.store_settings FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));

CREATE POLICY "admins insert store settings"
  ON public.store_settings FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));

CREATE TRIGGER store_settings_touch
  BEFORE UPDATE ON public.store_settings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.store_settings (id) VALUES (true) ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.dishes
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS prep_minutes integer;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS eta_minutes integer;

ALTER PUBLICATION supabase_realtime ADD TABLE public.store_settings;