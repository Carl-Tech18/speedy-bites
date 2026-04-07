
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('buyer', 'owner', 'admin');

-- User roles table (separate from profiles per security guidelines)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL DEFAULT 'buyer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own roles"
ON public.user_roles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Auto-assign buyer role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'buyer');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_role
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- Owner restaurants table
CREATE TABLE public.owner_restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  cuisine TEXT NOT NULL DEFAULT 'rice',
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  address TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.owner_restaurants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active restaurants"
ON public.owner_restaurants FOR SELECT USING (is_active = true);

CREATE POLICY "Owners can manage their restaurants"
ON public.owner_restaurants FOR INSERT
WITH CHECK (auth.uid() = owner_id AND public.has_role(auth.uid(), 'owner'));

CREATE POLICY "Owners can update their restaurants"
ON public.owner_restaurants FOR UPDATE
USING (auth.uid() = owner_id AND public.has_role(auth.uid(), 'owner'));

CREATE POLICY "Owners can delete their restaurants"
ON public.owner_restaurants FOR DELETE
USING (auth.uid() = owner_id AND public.has_role(auth.uid(), 'owner'));

-- Owner menu items
CREATE TABLE public.owner_menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.owner_restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  image_url TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.owner_menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available menu items"
ON public.owner_menu_items FOR SELECT USING (true);

CREATE POLICY "Owners can manage their menu items"
ON public.owner_menu_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.owner_restaurants
    WHERE id = restaurant_id AND owner_id = auth.uid()
  )
);

CREATE POLICY "Owners can update their menu items"
ON public.owner_menu_items FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.owner_restaurants
    WHERE id = restaurant_id AND owner_id = auth.uid()
  )
);

CREATE POLICY "Owners can delete their menu items"
ON public.owner_menu_items FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.owner_restaurants
    WHERE id = restaurant_id AND owner_id = auth.uid()
  )
);

-- ID verifications
CREATE TABLE public.id_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  id_image_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewer_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.id_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own verifications"
ON public.id_verifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can submit verifications"
ON public.id_verifications FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- ID documents storage bucket (private)
INSERT INTO storage.buckets (id, name, public) VALUES ('id-documents', 'id-documents', false);

CREATE POLICY "Users can upload their own ID documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'id-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own ID documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'id-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Restaurant images bucket (public)
INSERT INTO storage.buckets (id, name, public) VALUES ('restaurant-images', 'restaurant-images', true);

CREATE POLICY "Anyone can view restaurant images"
ON storage.objects FOR SELECT
USING (bucket_id = 'restaurant-images');

CREATE POLICY "Owners can upload restaurant images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'restaurant-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Owners can update restaurant images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'restaurant-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Trigger for updated_at on owner tables
CREATE TRIGGER update_owner_restaurants_updated_at
BEFORE UPDATE ON public.owner_restaurants
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_owner_menu_items_updated_at
BEFORE UPDATE ON public.owner_menu_items
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
