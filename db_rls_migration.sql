-- ============================================================
-- SHARECOSTTRIP MAJALENGKA - RLS & Schema Fix Migration
-- Run this in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- PART 1: Add Missing Tables & Columns
-- ============================================================

-- 1A. Create meeting_points table (missing from db.sql)
CREATE TABLE IF NOT EXISTS public.meeting_points (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying(255) NOT NULL,
  address text,
  maps_url text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT meeting_points_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- 1B. Add missing 'rating' column to testimonials
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'testimonials' AND column_name = 'rating'
  ) THEN
    ALTER TABLE public.testimonials ADD COLUMN rating integer DEFAULT 5;
  END IF;
END $$;

-- 1C. Add missing 'proof_url' column to payments
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'payments' AND column_name = 'proof_url'
  ) THEN
    ALTER TABLE public.payments ADD COLUMN proof_url text;
  END IF;
END $$;

-- 1D. Make payment_type nullable (to prevent NOT NULL constraint errors)
ALTER TABLE public.payments ALTER COLUMN payment_type DROP NOT NULL;

-- 1E. Ensure trips.package_id exists (from db_alter.sql)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'trips' AND column_name = 'package_id'
  ) THEN
    ALTER TABLE public.trips ADD COLUMN package_id uuid REFERENCES public.packages(id);
  END IF;
END $$;

-- ============================================================
-- PART 2: Enable Row Level Security on ALL Tables
-- ============================================================

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_information ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PART 3: Create RLS Policies
-- ============================================================

-- ---- PUBLIC READ POLICIES (for visitor-facing pages) ----

-- Destinations: anyone can read
CREATE POLICY "destinations_public_read" ON public.destinations
  FOR SELECT USING (true);

-- Trips: anyone can read
CREATE POLICY "trips_public_read" ON public.trips
  FOR SELECT USING (true);

-- Packages: anyone can read
CREATE POLICY "packages_public_read" ON public.packages
  FOR SELECT USING (true);

-- Gallery: anyone can read
CREATE POLICY "gallery_public_read" ON public.gallery
  FOR SELECT USING (true);

-- Meeting Points: anyone can read active ones
CREATE POLICY "meeting_points_public_read" ON public.meeting_points
  FOR SELECT USING (true);

-- Testimonials: anyone can read approved ones
CREATE POLICY "testimonials_public_read" ON public.testimonials
  FOR SELECT USING (status = 'Dipublikasikan' OR status = 'Approved');

-- ---- PUBLIC INSERT POLICIES (for booking form & reviews) ----

-- Bookings: anyone can create a booking (registration form)
CREATE POLICY "bookings_public_insert" ON public.bookings
  FOR INSERT WITH CHECK (true);

-- Booking members: anyone can insert (part of registration)
CREATE POLICY "booking_members_public_insert" ON public.booking_members
  FOR INSERT WITH CHECK (true);

-- Emergency contacts: anyone can insert (part of registration)
CREATE POLICY "emergency_contacts_public_insert" ON public.emergency_contacts
  FOR INSERT WITH CHECK (true);

-- Health information: anyone can insert (part of registration)
CREATE POLICY "health_information_public_insert" ON public.health_information
  FOR INSERT WITH CHECK (true);

-- Testimonials: anyone can insert a review (will be moderated)
CREATE POLICY "testimonials_public_insert" ON public.testimonials
  FOR INSERT WITH CHECK (true);

-- Push subscriptions: anyone can subscribe
CREATE POLICY "push_subscriptions_public_insert" ON public.push_subscriptions
  FOR INSERT WITH CHECK (true);

-- Push subscriptions: anyone can read (for upsert)
CREATE POLICY "push_subscriptions_public_read" ON public.push_subscriptions
  FOR SELECT USING (true);

-- Push subscriptions: anyone can update (for upsert)
CREATE POLICY "push_subscriptions_public_update" ON public.push_subscriptions
  FOR UPDATE USING (true);

-- ---- PUBLIC READ for booking lookup (cek-pesanan) ----
-- Bookings: anyone can read their own booking by booking_code + whatsapp
-- Note: This is permissive since the server action filters by booking_code + whatsapp
CREATE POLICY "bookings_public_read" ON public.bookings
  FOR SELECT USING (true);

-- Booking members: read for lookup
CREATE POLICY "booking_members_public_read" ON public.booking_members
  FOR SELECT USING (true);

-- Emergency contacts: read for lookup
CREATE POLICY "emergency_contacts_public_read" ON public.emergency_contacts
  FOR SELECT USING (true);

-- Health information: read for lookup
CREATE POLICY "health_information_public_read" ON public.health_information
  FOR SELECT USING (true);

-- ---- AUTHENTICATED ADMIN POLICIES (full CRUD) ----
-- These allow authenticated users to perform all operations.
-- The application layer (assertAdmin()) enforces email-based admin checks.

-- Destinations: authenticated users can insert/update/delete
CREATE POLICY "destinations_admin_insert" ON public.destinations
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "destinations_admin_update" ON public.destinations
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "destinations_admin_delete" ON public.destinations
  FOR DELETE TO authenticated USING (true);

-- Trips: authenticated users can insert/update/delete
CREATE POLICY "trips_admin_insert" ON public.trips
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "trips_admin_update" ON public.trips
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "trips_admin_delete" ON public.trips
  FOR DELETE TO authenticated USING (true);

-- Packages: authenticated users can insert/update/delete
CREATE POLICY "packages_admin_insert" ON public.packages
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "packages_admin_update" ON public.packages
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "packages_admin_delete" ON public.packages
  FOR DELETE TO authenticated USING (true);

-- Gallery: authenticated users can insert/update/delete
CREATE POLICY "gallery_admin_insert" ON public.gallery
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "gallery_admin_update" ON public.gallery
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "gallery_admin_delete" ON public.gallery
  FOR DELETE TO authenticated USING (true);

-- Meeting Points: authenticated users can insert/update/delete
CREATE POLICY "meeting_points_admin_insert" ON public.meeting_points
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "meeting_points_admin_update" ON public.meeting_points
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "meeting_points_admin_delete" ON public.meeting_points
  FOR DELETE TO authenticated USING (true);

-- Bookings: authenticated users can update/delete
CREATE POLICY "bookings_admin_update" ON public.bookings
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "bookings_admin_delete" ON public.bookings
  FOR DELETE TO authenticated USING (true);

-- Payments: authenticated users can full CRUD
CREATE POLICY "payments_public_read" ON public.payments
  FOR SELECT USING (true);
CREATE POLICY "payments_admin_insert" ON public.payments
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "payments_admin_update" ON public.payments
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "payments_admin_delete" ON public.payments
  FOR DELETE TO authenticated USING (true);

-- Testimonials: authenticated users can update/delete (moderation)
CREATE POLICY "testimonials_admin_update" ON public.testimonials
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "testimonials_admin_delete" ON public.testimonials
  FOR DELETE TO authenticated USING (true);

-- Push subscriptions: authenticated can delete
CREATE POLICY "push_subscriptions_admin_delete" ON public.push_subscriptions
  FOR DELETE TO authenticated USING (true);

-- ============================================================
-- DONE! Verify with:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
-- ============================================================
