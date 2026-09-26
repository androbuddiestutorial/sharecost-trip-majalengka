create table public.booking_members (
  id uuid not null default extensions.uuid_generate_v4 (),
  booking_id uuid null,
  full_name character varying(255) not null,
  whatsapp character varying(20) not null,
  address text not null,
  created_at timestamp with time zone null default now(),
  constraint booking_members_pkey primary key (id),
  constraint booking_members_booking_id_fkey foreign KEY (booking_id) references bookings (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.bookings (
  id uuid not null default extensions.uuid_generate_v4 (),
  booking_code character varying(20) not null,
  trip_id uuid null,
  full_name character varying(255) not null,
  address text not null,
  gender character varying(20) not null,
  birth_date date not null,
  whatsapp character varying(20) not null,
  email character varying(255) not null,
  trip_type character varying(50) not null,
  meeting_point character varying(255) not null,
  pax integer not null default 1,
  source_info character varying(100) null,
  social_media character varying(100) null,
  status character varying(50) null default 'Menunggu Verifikasi'::character varying,
  payment_status character varying(50) null default 'Belum Bayar'::character varying,
  total_amount numeric(12, 2) not null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint bookings_pkey primary key (id),
  constraint bookings_booking_code_key unique (booking_code),
  constraint bookings_trip_id_fkey foreign KEY (trip_id) references trips (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.destinations (
  id uuid not null default extensions.uuid_generate_v4 (),
  title character varying(255) not null,
  location character varying(255) not null,
  price numeric(10, 2) not null,
  image character varying(255) null,
  description text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  image_url text null,
  constraint destinations_pkey primary key (id)
) TABLESPACE pg_default;

create table public.emergency_contacts (
  id uuid not null default extensions.uuid_generate_v4 (),
  booking_id uuid null,
  full_name character varying(255) not null,
  relationship character varying(100) not null,
  whatsapp character varying(20) not null,
  created_at timestamp with time zone null default now(),
  constraint emergency_contacts_pkey primary key (id),
  constraint emergency_contacts_booking_id_key unique (booking_id),
  constraint emergency_contacts_booking_id_fkey foreign KEY (booking_id) references bookings (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.gallery (
  id uuid not null default extensions.uuid_generate_v4 (),
  title character varying(255) not null,
  category character varying(100) null,
  image_url text not null,
  created_at timestamp with time zone null default now(),
  constraint gallery_pkey primary key (id)
) TABLESPACE pg_default;

create table public.health_information (
  id uuid not null default extensions.uuid_generate_v4 (),
  booking_id uuid null,
  has_condition boolean not null default false,
  description text null,
  created_at timestamp with time zone null default now(),
  constraint health_information_pkey primary key (id),
  constraint health_information_booking_id_key unique (booking_id),
  constraint health_information_booking_id_fkey foreign KEY (booking_id) references bookings (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.packages (
  id uuid not null default extensions.uuid_generate_v4 (),
  title character varying(100) not null,
  description character varying(255) not null,
  price_text character varying(50) not null,
  features jsonb not null default '[]'::jsonb,
  is_popular boolean null default false,
  action_type character varying(50) null default 'booking'::character varying,
  created_at timestamp with time zone null default now(),
  constraint packages_pkey primary key (id)
) TABLESPACE pg_default;

create table public.payments (
  id uuid not null default extensions.uuid_generate_v4 (),
  booking_id uuid null,
  amount numeric(12, 2) not null,
  payment_type character varying(50) not null,
  payment_method character varying(50) not null,
  status character varying(50) null default 'Menunggu Verifikasi'::character varying,
  payment_date timestamp with time zone null default now(),
  notes text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint payments_pkey primary key (id),
  constraint payments_booking_id_fkey foreign KEY (booking_id) references bookings (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.push_subscriptions (
  id uuid not null default gen_random_uuid (),
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint push_subscriptions_pkey primary key (id),
  constraint push_subscriptions_endpoint_key unique (endpoint)
) TABLESPACE pg_default;

create table public.testimonials (
  id uuid not null default extensions.uuid_generate_v4 (),
  participant_name character varying(255) not null,
  trip_name character varying(255) not null,
  review text not null,
  status character varying(50) null default 'Draft'::character varying,
  created_at timestamp with time zone null default now(),
  constraint testimonials_pkey primary key (id)
) TABLESPACE pg_default;

create table public.trips (
  id uuid not null default extensions.uuid_generate_v4 (),
  destination_id uuid null,
  date_start date not null,
  date_end date not null,
  quota integer not null default 15,
  status character varying(50) null default 'Terbuka'::character varying,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint trips_pkey primary key (id),
  constraint trips_destination_id_fkey foreign KEY (destination_id) references destinations (id) on delete CASCADE
) TABLESPACE pg_default;