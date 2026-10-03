ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS spend_discount_enabled boolean NOT NULL DEFAULT false;
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS spend_discount_min integer NOT NULL DEFAULT 150;
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS spend_discount_percent integer NOT NULL DEFAULT 10;