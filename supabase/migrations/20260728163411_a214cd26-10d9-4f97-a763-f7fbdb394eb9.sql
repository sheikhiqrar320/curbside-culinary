-- ROLES ---------------------------------------------------------------
CREATE TYPE public.app_role AS ENUM ('admin', 'restaurant_owner', 'customer');
CREATE TYPE public.approval_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.order_status AS ENUM ('received', 'accepted', 'preparing', 'out_for_delivery', 'delivered', 'cancelled');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "own profile write" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());

CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'phone')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RESTAURANTS ---------------------------------------------------------
CREATE TABLE public.restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  cuisines text[] NOT NULL DEFAULT '{}',
  description text NOT NULL DEFAULT '',
  image_url text,
  rating numeric(2,1) NOT NULL DEFAULT 4.0,
  reviews int NOT NULL DEFAULT 0,
  delivery_min int NOT NULL DEFAULT 30,
  delivery_max int NOT NULL DEFAULT 45,
  cost_for_two int NOT NULL DEFAULT 500,
  offer text,
  pure_veg boolean NOT NULL DEFAULT false,
  featured boolean NOT NULL DEFAULT false,
  status public.approval_status NOT NULL DEFAULT 'pending',
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.restaurants TO authenticated;
GRANT SELECT ON public.restaurants TO anon;
GRANT ALL ON public.restaurants TO service_role;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public reads approved restaurants" ON public.restaurants FOR SELECT TO anon, authenticated
  USING (status = 'approved');
CREATE POLICY "owners read own restaurants" ON public.restaurants FOR SELECT TO authenticated
  USING (owner_id = auth.uid());
CREATE POLICY "admins read all restaurants" ON public.restaurants FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "owners create restaurants" ON public.restaurants FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());
CREATE POLICY "owners update own restaurants" ON public.restaurants FOR UPDATE TO authenticated
  USING (owner_id = auth.uid());
CREATE POLICY "admins manage restaurants" ON public.restaurants FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- DISHES --------------------------------------------------------------
CREATE TABLE public.dishes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  price int NOT NULL CHECK (price >= 0),
  veg boolean NOT NULL DEFAULT false,
  category text NOT NULL DEFAULT 'Mains',
  recommended boolean NOT NULL DEFAULT false,
  available boolean NOT NULL DEFAULT true,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dishes TO authenticated;
GRANT SELECT ON public.dishes TO anon;
GRANT ALL ON public.dishes TO service_role;
ALTER TABLE public.dishes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public reads dishes of approved restaurants" ON public.dishes FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND r.status = 'approved'));
CREATE POLICY "owners read own dishes" ON public.dishes FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND r.owner_id = auth.uid()));
CREATE POLICY "owners manage own dishes" ON public.dishes FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND r.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND r.owner_id = auth.uid()));
CREATE POLICY "admins manage dishes" ON public.dishes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ORDERS --------------------------------------------------------------
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  restaurant_id uuid REFERENCES public.restaurants(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  payment_method text NOT NULL DEFAULT 'cod',
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal int NOT NULL DEFAULT 0,
  discount int NOT NULL DEFAULT 0,
  delivery_fee int NOT NULL DEFAULT 0,
  tax int NOT NULL DEFAULT 0,
  total int NOT NULL DEFAULT 0,
  status public.order_status NOT NULL DEFAULT 'received',
  placed_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "customers read own orders" ON public.orders FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "customers create own orders" ON public.orders FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "owners read restaurant orders" ON public.orders FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND r.owner_id = auth.uid()));
CREATE POLICY "owners update restaurant orders" ON public.orders FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND r.owner_id = auth.uid()));
CREATE POLICY "admins manage orders" ON public.orders FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER orders_touch_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- SEED ----------------------------------------------------------------
INSERT INTO public.restaurants (slug, name, cuisines, description, rating, reviews, delivery_min, delivery_max, cost_for_two, offer, pure_veg, featured, status, reviewed_at) VALUES
 ('spice-route-kitchen','Spice Route Kitchen','{"North Indian","Biryani","Mughlai"}','Slow-cooked dum biryanis and charcoal kebabs since 1998.',4.6,2841,30,40,600,'50% OFF up to ₹150',false,true,'approved',now()),
 ('the-dough-room','The Dough Room','{"Italian","Pizza","Pasta"}','Naples-style sourdough bases, 48-hour ferment.',4.8,1920,25,30,800,'Free delivery',false,true,'approved',now()),
 ('burger-theory','Burger Theory','{"American","Burgers","Shakes"}','Smashed patties, potato buns and thick shakes.',4.3,3510,15,25,450,'Flat ₹100 OFF above ₹399',false,true,'approved',now()),
 ('sakura-zen','Sakura Zen','{"Pan-Asian","Sushi","Bowls"}','Sushi counter and donburi bowls.',4.7,1204,40,50,1200,NULL,false,true,'approved',now()),
 ('green-harvest','Green Harvest','{"Healthy","Salads","Juices"}','Cold-pressed juices and grain bowls.',4.4,860,20,25,350,'20% OFF',true,false,'approved',now()),
 ('tandoor-tales','Tandoor Tales','{"North Indian","Kebabs"}','Clay-oven kebabs and buttery gravies.',4.1,1480,35,45,700,NULL,false,false,'pending',NULL),
 ('coastal-catch','Coastal Catch','{"Seafood","Mangalorean"}','Ghee roast prawns and neer dosa, straight off the coast.',4.5,320,35,50,900,NULL,false,false,'pending',NULL),
 ('midnight-mithai','Midnight Mithai','{"Desserts","Bakery"}','Late-night gulab jamun cheesecake and hot brownies.',4.2,210,20,30,300,NULL,true,false,'pending',NULL),
 ('wok-o-clock','Wok O Clock','{"Chinese","Noodles"}','Wok-tossed hakka noodles and chilli paneer.',3.6,95,25,40,400,NULL,false,false,'rejected',now());

INSERT INTO public.dishes (restaurant_id, name, description, price, veg, category, recommended, available)
SELECT r.id, d.name, d.description, d.price, d.veg, d.category, d.recommended, d.available
FROM (VALUES
 ('spice-route-kitchen','Hyderabadi Dum Chicken Biryani','Long-grain basmati, bone-in chicken, saffron and fried onion.',429,false,'Biryani',true,true),
 ('spice-route-kitchen','Paneer Tikka Biryani','Charred paneer, mint and whole spices layered over dum rice.',379,true,'Biryani',true,true),
 ('spice-route-kitchen','Old Delhi Butter Chicken','Boneless thigh in a slow-reduced tomato and cashew gravy.',449,false,'Mains',false,true),
 ('the-dough-room','Double Cheese Margherita','San Marzano tomato, fior di latte, basil.',329,true,'Pizza',true,true),
 ('the-dough-room','Spicy Pepperoni','Cup-and-char pepperoni, hot honey drizzle.',469,false,'Pizza',false,true),
 ('the-dough-room','Truffle Mushroom Pasta','Tagliatelle, cream, wild mushrooms, truffle oil.',419,true,'Pasta',false,false),
 ('burger-theory','Classic Double Smash','Two smashed patties, American cheese, pickles.',289,false,'Burgers',true,true),
 ('burger-theory','Crispy Paneer Burger','Buttermilk-fried paneer, slaw, sriracha mayo.',249,true,'Burgers',false,true),
 ('sakura-zen','Salmon Avocado Roll','Eight pieces, Norwegian salmon, avocado.',549,false,'Sushi',true,true),
 ('sakura-zen','Veg Tempura Bowl','Seasonal vegetables, sushi rice, ponzu.',399,true,'Bowls',false,true),
 ('green-harvest','Harvest Grain Bowl','Quinoa, roasted pumpkin, feta, lemon tahini.',349,true,'Bowls',true,true),
 ('green-harvest','Cold-Pressed Citrus Trio','Orange, carrot and ginger. No added sugar.',189,true,'Juices',false,true),
 ('tandoor-tales','Galouti Kebab Platter','Six melt-in-mouth kebabs with warqi paratha.',499,false,'Kebabs',true,true),
 ('tandoor-tales','Malai Broccoli','Cheddar and cream marinade, clay oven finished.',359,true,'Kebabs',false,true)
) AS d(slug,name,description,price,veg,category,recommended,available)
JOIN public.restaurants r ON r.slug = d.slug;

INSERT INTO public.orders (code, restaurant_id, customer_name, phone, address, payment_method, items, subtotal, discount, delivery_fee, tax, total, status, placed_at)
SELECT o.code, r.id, o.customer_name, o.phone, o.address, o.payment, o.items::jsonb, o.subtotal, o.discount, 39, o.tax, o.total, o.status::public.order_status, now() - (o.hours_ago || ' hours')::interval
FROM (VALUES
 ('SLD-100241','spice-route-kitchen','Ananya Mehta','+91 98450 11223','12, 5th Cross, HSR Layout, Bengaluru','upi','[{"name":"Hyderabadi Dum Chicken Biryani","qty":2,"price":429}]',858,150,35,782,'delivered',52),
 ('SLD-100242','the-dough-room','Vikram Rao','+91 98860 44120','44 Indiranagar 100ft Road, Bengaluru','card','[{"name":"Double Cheese Margherita","qty":1,"price":329},{"name":"Spicy Pepperoni","qty":1,"price":469}]',798,0,40,877,'delivered',30),
 ('SLD-100243','burger-theory','Fatima Sheikh','+91 99001 77345','7 Jayanagar 4th Block, Bengaluru','cod','[{"name":"Classic Double Smash","qty":3,"price":289}]',867,100,38,844,'out_for_delivery',1),
 ('SLD-100244','sakura-zen','Rahul Nair','+91 90350 66211','A-302 Koramangala 6th Block, Bengaluru','upi','[{"name":"Salmon Avocado Roll","qty":2,"price":549}]',1098,0,55,1192,'preparing',1),
 ('SLD-100245','green-harvest','Meera Iyer','+91 98801 33440','19 Whitefield Main Road, Bengaluru','upi','[{"name":"Harvest Grain Bowl","qty":1,"price":349},{"name":"Cold-Pressed Citrus Trio","qty":2,"price":189}]',727,0,36,802,'accepted',2),
 ('SLD-100246','spice-route-kitchen','Karthik S','+91 91080 22119','88 BTM Layout 2nd Stage, Bengaluru','cod','[{"name":"Paneer Tikka Biryani","qty":1,"price":379},{"name":"Old Delhi Butter Chicken","qty":1,"price":449}]',828,0,41,908,'received',0),
 ('SLD-100247','the-dough-room','Priya Raghavan','+91 97400 55123','5 Richmond Town, Bengaluru','card','[{"name":"Truffle Mushroom Pasta","qty":2,"price":419}]',838,100,37,814,'cancelled',26),
 ('SLD-100248','burger-theory','Aditya Menon','+91 96320 88112','23 Ulsoor Lake Road, Bengaluru','upi','[{"name":"Crispy Paneer Burger","qty":2,"price":249}]',498,0,25,562,'delivered',74),
 ('SLD-100249','sakura-zen','Neha Gupta','+91 99860 12009','66 JP Nagar 7th Phase, Bengaluru','card','[{"name":"Veg Tempura Bowl","qty":2,"price":399}]',798,0,40,877,'delivered',98),
 ('SLD-100250','green-harvest','Sanjay Bhat','+91 90190 45566','3 Malleshwaram 8th Cross, Bengaluru','cod','[{"name":"Harvest Grain Bowl","qty":2,"price":349}]',698,0,35,772,'delivered',120)
) AS o(code,slug,customer_name,phone,address,payment,items,subtotal,discount,tax,total,status,hours_ago)
JOIN public.restaurants r ON r.slug = o.slug;