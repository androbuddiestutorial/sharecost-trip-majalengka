# SHARECOSTTRIP MAJALENGKA

## Project Specification & AI Development Guidelines

> **IMPORTANT:** This file is the main source of truth for the SHARECOSTTRIP MAJALENGKA project.
>
> Any AI coding agent working on this project MUST read this file before making changes.
>
> Do not introduce features, technologies, database structures, UI patterns, or architectural changes that conflict with this document unless explicitly requested by the project owner.

---

# 1. PROJECT IDENTITY

**Project Name:**

SHARECOSTTRIP MAJALENGKA

**Project Type:**

Mountain Trip / Hiking Trip Management Platform

**Primary Purpose:**

A professional website for promoting, managing, and registering participants for mountain trips.

The system must support:

* Public trip information
* Mountain destinations
* Trip schedules
* Trip packages
* Multi-step registration
* Participant management
* Booking management
* Payment tracking
* WhatsApp verification
* Admin dashboard
* Gallery
* Testimonials
* SEO
* Future monetization

---

# 2. CORE PRINCIPLE

The application must be built as a real, maintainable web application.

Do NOT create a static mockup only.

The application must be prepared for:

* Real users
* Real database
* Real participant registrations
* Real admin operations
* Future scaling

Prioritize:

1. Reliability
2. Security
3. Mobile usability
4. Clean architecture
5. Maintainability
6. Performance
7. SEO
8. Simple administration

---

# 3. TECHNOLOGY STACK

Preferred stack:

* Next.js
* TypeScript
* Tailwind CSS
* shadcn/ui where appropriate
* Supabase
* PostgreSQL
* Supabase Authentication
* Supabase Storage

Use modern stable versions compatible with the project.

Do not introduce unnecessary frameworks or libraries.

Before adding a new dependency, consider whether the functionality can be implemented using the existing stack.

---

# 4. AI DEVELOPMENT RULES

Every AI coding agent MUST:

1. Read `PROJECT.md` before making changes.
2. Understand the existing project structure before modifying files.
3. Reuse existing components whenever possible.
4. Avoid unnecessary rewrites.
5. Avoid breaking existing functionality.
6. Avoid duplicate components.
7. Avoid duplicate database tables.
8. Avoid hard-coded business data.
9. Keep business data configurable through the database/admin panel.
10. Maintain responsive behavior.
11. Maintain security rules.
12. Maintain SEO.
13. Explain significant architectural changes before implementing them.
14. Check related files before changing shared components.
15. Test affected functionality after making changes.

---

# 5. CHANGE MANAGEMENT RULE

When modifying an existing feature:

* Do not rebuild the entire application.
* Modify only the required parts.
* Preserve existing behavior unless the change explicitly requires otherwise.
* Check dependencies before removing or replacing components.
* Do not delete existing functionality without explicit approval.

If a requested feature conflicts with an existing architecture:

1. Identify the conflict.
2. Explain the impact.
3. Propose the smallest safe architectural change.
4. Wait for confirmation if the change is significant.

---

# 6. PUBLIC WEBSITE

Main navigation:

* Home
* Destinasi
* Jadwal Trip
* Paket
* Itinerary
* Gallery
* Tentang Kami
* FAQ
* Kontak
* Daftar Trip

Primary CTA:

**Daftar Trip**

Secondary CTA:

**Chat WhatsApp**

---

# 7. HOMEPAGE

Homepage sections:

1. Hero
2. Destinasi Populer
3. Jadwal Trip Terdekat
4. Mengapa SHARECOSTTRIP
5. Paket Trip
6. Itinerary
7. Guide / Porter
8. Gallery
9. Testimoni
10. CTA
11. Footer

Hero headline:

**Jelajahi Gunung, Nikmati Perjalanan, Bagikan Pengalaman.**

Hero description:

**SHARECOSTTRIP MAJALENGKA — Teman perjalanan untuk menjelajahi berbagai destinasi gunung dengan perjalanan yang terorganisir, aman, dan menyenangkan.**

Primary CTA:

**Lihat Trip**

Secondary CTA:

**Daftar Sekarang**

---

# 8. DESTINATION SYSTEM

Each destination may contain:

* Name
* Slug
* Location
* Elevation
* Difficulty
* Duration
* Description
* Main image
* Gallery
* Route information
* Meeting points
* Facilities
* Equipment requirements
* Itinerary
* Available trips

Destination data MUST come from the database.

Do not hard-code destinations inside UI components.

---

# 9. TRIP SYSTEM

Each trip must contain:

* Destination
* Trip type
* Date
* Departure time
* Meeting point
* Total quota
* Occupied quota
* Available quota
* Price
* Status
* Description
* Package
* Itinerary

Trip statuses:

* OPEN
* ALMOST_FULL
* FULL
* COMPLETED
* CANCELLED

A trip with no remaining quota must not accept new registrations.

---

# 10. TRIP TYPES

Supported trip types:

### Open Trip

Participants join a shared trip with other participants.

### Regular Trip

Standard organized trip package.

### Private Trip

A trip arranged specifically for a group.

The system must allow additional trip types in the future.

Do not hard-code the list if it can reasonably be managed from the database.

---

# 11. BOOKING SYSTEM

The booking system uses a multi-step form.

Progress:

1. Data Pemesan
2. Data Keberangkatan
3. Kontak Darurat
4. Kondisi & Kebutuhan
5. Informasi Tambahan
6. Persetujuan

User must be able to:

* Next
* Back
* Review
* Submit

Form data must not disappear when moving between steps.

---

# 12. BOOKING STEP 1 — DATA PEMESAN

Fields:

* Nama Lengkap
* Alamat Lengkap
* Jenis Kelamin
* Tanggal Lahir
* Nomor HP / WhatsApp
* Email

Required fields must have validation.

---

# 13. BOOKING STEP 2 — DATA KEBERANGKATAN

Fields:

### Jenis Trip

* Open Trip
* Regular Trip
* Private Trip

### Destinasi

Loaded from database.

### Jadwal

Only available trips for the selected destination should be shown.

### Meeting Point

Options:

* Cirebon
* Kuningan
* Majalengka
* Lainnya

If `Lainnya` is selected:

Show:

**Meeting Point Lainnya**

### Jumlah Peserta

1–10 people.

If more than one participant:

Show member forms.

Each member:

* Name
* WhatsApp
* Address

---

# 14. BOOKING STEP 3 — EMERGENCY CONTACT

Fields:

* Emergency Contact Name
* Relationship
* WhatsApp Number

All required.

---

# 15. BOOKING STEP 4 — HEALTH INFORMATION

Question:

**Apakah Anda memiliki kondisi kesehatan yang perlu kami ketahui?**

Options:

* Iya
* Tidak

If Iya:

Show:

**Jelaskan kondisi kesehatan tersebut**

Use textarea.

Add notice:

> Informasi ini digunakan untuk membantu penyelenggara mempersiapkan perjalanan dan bukan sebagai pengganti pemeriksaan medis.

Health information must be treated as private data.

Do not display it publicly.

---

# 16. BOOKING STEP 5 — MARKETING SOURCE

Question:

**Dari mana Anda mengetahui informasi Open Trip ini?**

Options:

* TikTok
* Instagram
* Kerabat/Teman
* Lainnya

Optional field:

**Username TikTok/Instagram**

---

# 17. BOOKING STEP 6 — PARTICIPANT AGREEMENT

Required checkboxes:

* Saya menyatakan bahwa seluruh data yang saya isi adalah benar dan dapat dipertanggungjawabkan.
* Saya bersedia mengikuti seluruh ketentuan dan peraturan Open Trip.
* Saya memahami bahwa keselamatan selama perjalanan merupakan tanggung jawab bersama dan saya wajib mengikuti arahan dari pihak penyelenggara.
* Saya menyetujui penggunaan data yang saya berikan untuk keperluan administrasi dan komunikasi terkait Open Trip.

All checkboxes must be accepted before submission.

---

# 18. BOOKING SUBMISSION

After successful submission:

Generate a unique booking ID.

Show:

**TERIMA KASIH!**

Message:

> Data pendaftaran Anda telah kami terima.
>
> Silakan tunggu informasi selanjutnya dari admin mengenai konfirmasi peserta, pembayaran, meeting point, perlengkapan, dan informasi keberangkatan.

Display:

* Booking ID
* Participant name
* Destination
* Trip date
* Number of participants
* Booking status

Initial status:

**MENUNGGU VERIFIKASI**

---

# 19. BOOKING STATUS

Supported statuses:

1. MENUNGGU VERIFIKASI
2. DATA DIVERIFIKASI
3. MENUNGGU PEMBAYARAN
4. PEMBAYARAN SEBAGIAN
5. LUNAS
6. TERDAFTAR
7. DITOLAK
8. DIBATALKAN
9. SELESAI TRIP

Every status change should be recorded in:

`booking_status_history`

---

# 20. WHATSAPP INTEGRATION

WhatsApp is an important part of the verification workflow.

Admin must have a button:

**WhatsApp Peserta**

The button opens WhatsApp using a generated message.

Example:

> Halo [Nama], kami dari SHARECOSTTRIP MAJALENGKA. Kami telah menerima pendaftaran Anda dengan nomor [BOOKING_ID]. Kami ingin melakukan konfirmasi data dan proses selanjutnya.

Admin WhatsApp number must be configurable from Settings.

Do not assume WhatsApp Business API exists.

Version 1 can use WhatsApp deep links.

---

# 21. PAYMENT SYSTEM

Payment tracking must support:

* Total price
* DP
* Additional payment
* Total paid
* Remaining balance
* Payment status
* Payment date
* Payment notes

Payment statuses:

* BELUM BAYAR
* DP
* SEBAGIAN
* LUNAS

Version 1 does NOT require automatic payment gateway.

Architecture should allow payment gateway integration later.

---

# 22. ADMIN DASHBOARD

Route:

`/admin`

Sidebar:

* Dashboard
* Pendaftaran
* Peserta
* Jadwal Trip
* Destinasi
* Paket
* Pembayaran
* Itinerary
* Guide / Porter
* Gallery
* Testimoni
* Notifications
* Settings

---

# 23. ADMIN DASHBOARD STATISTICS

Show:

* Total Pendaftaran
* Pendaftaran Baru
* Peserta Aktif
* Menunggu Pembayaran
* Peserta Lunas
* Trip Mendatang
* Total Pendapatan
* Total Kuota Terisi

Show recent bookings.

---

# 24. ADMIN BOOKING MANAGEMENT

Booking table:

* Booking ID
* Name
* WhatsApp
* Destination
* Trip
* Date
* Participant count
* Total price
* Payment status
* Booking status
* Created date
* Actions

Features:

* Search
* Filter
* Sort
* Pagination

---

# 25. BOOKING DETAIL

Admin can see:

### Participant Information

### Member Information

### Trip Information

### Emergency Contact

### Health Information

### Marketing Source

### Agreement

### Payment

### Status History

Actions:

* WhatsApp
* Verify
* Change Status
* Add Payment
* Add Note

---

# 26. DATABASE

Use Supabase PostgreSQL.

Core tables:

```text
admin_users
destinations
trips
trip_packages
bookings
booking_members
emergency_contacts
health_information
marketing_sources
payments
booking_status_history
itineraries
guides
porters
gallery
testimonials
notifications
settings
```

Use UUID primary keys.

All relevant tables should have:

* id
* created_at
* updated_at

Use foreign keys correctly.

Avoid unnecessary duplication.

---

# 27. DATABASE RELATIONSHIP

Basic relationship:

```text
destination
    |
    └── trips
           |
           └── bookings
                  |
                  ├── booking_members
                  ├── emergency_contacts
                  ├── health_information
                  ├── payments
                  └── booking_status_history
```

Trips may have packages.

Bookings belong to a specific trip.

Participants must never be publicly exposed.

---

# 28. SUPABASE SECURITY

Must implement:

* Authentication
* Authorization
* Row Level Security
* Admin-only dashboard access
* Proper database policies

Never expose:

* Supabase service role key
* Private credentials
* Admin credentials

Never place secrets directly inside frontend source code.

---

# 29. PRIVACY

Participant information is private.

Never expose:

* Phone number
* Address
* Date of birth
* Emergency contact
* Health information
* Payment information

in public pages.

Provide:

* Privacy Policy
* Terms & Conditions

---

# 30. GALLERY

Gallery must support:

* Upload image
* Delete image
* Edit title
* Edit description
* Category
* Featured image

Use Supabase Storage.

Public website loads gallery images dynamically.

---

# 31. TESTIMONIALS

Admin can:

* Add
* Edit
* Delete
* Publish
* Unpublish

Fields:

* Participant name
* Testimonial
* Photo
* Trip
* Date
* Published status

Only published testimonials appear publicly.

---

# 32. ITINERARY

Itinerary should be manageable from admin.

Example:

```text
Meeting Point
↓
Departure
↓
Basecamp
↓
Registration
↓
Hiking
↓
Rest
↓
Summit / Destination
↓
Descent
↓
Return
```

Do not hard-code itinerary data.

---

# 33. GUIDE & PORTER

Admin can manage:

* Name
* Photo
* Role
* Description
* Experience
* Availability

Roles may include:

* Guide
* Porter
* Documentation
* Driver

---

# 34. SEO

Implement:

* Metadata
* Dynamic metadata
* Open Graph
* Sitemap
* Robots
* Canonical URLs
* Structured data where appropriate

SEO-friendly routes:

```text
/destinasi
/destinasi/[slug]
/trip
/trip/[slug]
/booking
```

Avoid keyword stuffing.

---

# 35. RESPONSIVE DESIGN

Mobile-first.

Must work correctly on:

* Mobile
* Tablet
* Desktop

Registration form must be easy to use on smartphones.

Admin dashboard must also work on mobile.

---

# 36. DESIGN LANGUAGE

Visual direction:

**Modern Mountain Adventure**

Characteristics:

* Professional
* Clean
* Outdoor
* Natural
* Premium but accessible
* Strong typography
* Large photography
* Clear CTA
* Good whitespace

Avoid:

* Excessive gradients
* Excessive animations
* Generic AI dashboard appearance
* Excessive rounded cards
* Overloaded layouts

Animations should support UX, not distract users.

---

# 37. PERFORMANCE

Prioritize:

* Fast initial load
* Optimized images
* Lazy loading
* Server-side rendering where appropriate
* Minimal JavaScript
* Efficient database queries

Avoid unnecessary client components.

---

# 38. ERROR HANDLING

Every important operation must have:

* Loading state
* Success state
* Error state
* Empty state

Examples:

```text
Loading...

Data berhasil disimpan.

Terjadi kesalahan. Silakan coba lagi.

Belum ada data.
```

Do not expose technical errors directly to users.

---

# 39. FORM VALIDATION

Validate both:

### Client side

For better UX.

### Server side

For security and data integrity.

Never rely only on client-side validation.

Prevent duplicate submissions.

---

# 40. QUOTA MANAGEMENT

Trip capacity:

```text
Total Capacity
-
Confirmed Participants
=
Available Capacity
```

When capacity reaches zero:

Status:

**FULL**

Registration must be disabled.

The system must prevent race conditions / double booking when multiple people submit at nearly the same time.

---

# 41. PRICE CALCULATION

Prices must come from database.

Example:

```text
Price per person
×
Number of participants
=
Total price
```

Packages may have different prices.

Admin must be able to update prices without changing source code.

---

# 42. ADMIN SETTINGS

Settings should include:

* Website name
* Logo
* WhatsApp number
* Email
* Address
* Social media
* Payment account information
* Terms & Conditions
* Privacy Policy
* Notification settings

---

# 43. FUTURE FEATURES

Architecture should allow future integration of:

* WhatsApp Business API
* Email notification
* Payment gateway
* Participant account
* Participant dashboard
* Digital invoice
* PDF booking confirmation
* QR code booking
* QR check-in
* Automated reminders
* Affiliate system
* Partner system
* Hiking equipment marketplace
* Online reviews
* Advanced analytics

Do NOT implement all future features now.

Prepare the architecture so they can be added later.

---

# 44. MONETIZATION

Possible future monetization:

* Hiking equipment affiliate
* Partner hotels
* Homestay
* Transportation partners
* Sponsored trips
* Outdoor brands
* Ads

Monetization must remain modular.

Do not negatively affect the booking experience.

---

# 45. CURRENT DEVELOPMENT PRIORITY

Development order:

## PHASE 1

Public UI

## PHASE 2

Supabase setup

## PHASE 3

Database schema

## PHASE 4

Booking system

## PHASE 5

Authentication

## PHASE 6

Admin dashboard

## PHASE 7

WhatsApp workflow

## PHASE 8

Payment tracking

## PHASE 9

Gallery & Testimonials

## PHASE 10

SEO

## PHASE 11

Security review

## PHASE 12

Performance & responsive testing

---

# 46. AI AGENT WORKFLOW

Before starting any task:

```text
1. Read PROJECT.md
2. Inspect existing project structure
3. Identify related components
4. Identify related database tables
5. Determine what already exists
6. Make the smallest required change
7. Test the change
8. Check for regressions
9. Report what was changed
```

Never blindly overwrite existing code.

---

# 47. WHEN USER REQUESTS A NEW FEATURE

When a new feature is requested:

### If compatible:

Implement it while preserving the existing architecture.

### If it requires architectural changes:

Explain:

* What needs to change
* Why it needs to change
* Which files/components are affected
* Which database tables are affected
* Potential side effects

Then implement only after the user confirms if the change is significant.

---

# 48. CODE QUALITY

Follow:

* TypeScript strict typing
* Reusable components
* Clear naming
* Small focused functions
* Server/client separation
* Proper error handling
* No unnecessary duplication
* No unused code
* No unnecessary dependencies

Do not use:

```text
any
```

unless absolutely necessary.

---

# 49. BUSINESS DATA RULE

Business data must NOT be hard-coded when it should be editable.

Examples:

BAD:

```text
const price = 350000
```

GOOD:

```text
price comes from trip/package database
```

BAD:

```text
const whatsapp = "08xxxxxxxx"
```

GOOD:

```text
WhatsApp number comes from settings
```

---

# 50. SOURCE OF TRUTH

When there is a conflict between:

* Existing implementation
* Temporary AI assumption
* Random generated UI
* This document

This document should be treated as the project specification.

However, explicit instructions from the project owner in the current development session take priority.

If the project owner intentionally changes a requirement, update this document accordingly.

---

# 51. DOCUMENTATION RULE

When adding a major feature, update this `PROJECT.md` if the feature changes:

* Architecture
* Database
* User flow
* Admin workflow
* Security
* Core functionality

Keep this document concise enough to remain useful.

Do not fill it with implementation details that are no longer relevant.

---

# 52. IMPORTANT FINAL RULE

**DO NOT DRIFT FROM THE PROJECT.**

The AI agent must always understand that:

SHARECOSTTRIP MAJALENGKA is a real mountain trip management platform.

The goal is not simply to generate a visually attractive website.

The goal is to build a reliable system where:

```text
VISITOR
   ↓
DESTINATION
   ↓
TRIP
   ↓
BOOKING
   ↓
DATABASE
   ↓
ADMIN
   ↓
WHATSAPP VERIFICATION
   ↓
PAYMENT
   ↓
CONFIRMED PARTICIPANT
   ↓
TRIP
   ↓
COMPLETED
```

Every new feature should strengthen this workflow rather than create unnecessary complexity.

**Always read `PROJECT.md` before coding.**
