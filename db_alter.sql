ALTER TABLE public.trips 
ADD COLUMN package_id UUID REFERENCES public.packages(id) ON DELETE SET NULL;
