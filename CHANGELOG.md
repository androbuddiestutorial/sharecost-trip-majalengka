# Changelog

Semua perubahan yang mencolok pada project **Sharecosttrip Majalengka** akan didokumentasikan di file ini.

## [Unreleased] - Fase UI/UX Frontend & API Skeleton

### Added (Ditambahkan)
- **Framework Setup**: Inisialisasi Next.js 16 (App Router), TypeScript, dan Tailwind CSS v4.
- **Komponen UI**: Integrasi `shadcn/ui` versi terbaru yang menggunakan `@base-ui/react` (Button, Card, Input, Textarea, Select, Checkbox, RadioGroup, Dialog, Table, DropdownMenu, Avatar, Sheet, dll).
- **Public Website (Phase 1)**: 
  - Pembuatan Homepage (`/`) yang berisi Hero section, Destinasi Populer, Jadwal Trip Terdekat, Testimoni, Galeri Preview, dan Call-to-Action.
  - Halaman Daftar Destinasi Gunung (`/destinasi`).
  - Halaman Jadwal Open Trip (`/trip`).
- **Sistem Booking Multi-Step (Phase 4)**: 
  - Pembuatan form pendaftaran 6 langkah di `/booking` menggunakan `react-hook-form` dan `zod` schema validation.
  - Form dinamis untuk anggota tambahan berdasarkan jumlah peserta yang dipilih.
  - Halaman Sukses Booking (`/booking/success`).
- **Dashboard Admin (Phase 6)**:
  - Layout Dashboard responsif (`src/app/admin/layout.tsx`) dengan Sidebar Desktop dan Mobile Hamburger Menu.
  - Halaman Overview (`/admin`) berisi kartu ringkasan statistik (Total Pendaftaran, Pendapatan, dll).
  - Halaman Manajemen Pendaftaran (`/admin/bookings`) menggunakan Data Table.
  - Halaman Detail Pendaftaran (`/admin/bookings/[id]`) yang merangkum seluruh data dari 6 langkah form peserta.
- **Workflow WhatsApp (Phase 7)**:
  - Integrasi tombol "Chat WhatsApp" di halaman Admin Detail Booking dan Halaman Sukses untuk memverifikasi peserta menggunakan deep link `wa.me` dengan pesan konfirmasi yang terisi otomatis (pre-filled).
- **Manajemen Pembayaran (Phase 8)**:
  - Halaman Tabel Pembayaran (`/admin/payments`) untuk melihat status DP/Lunas.
  - Modal/Dialog untuk menambah data pencatatan pembayaran manual.
- **Galeri & Testimoni (Phase 9)**:
  - Halaman Publik Galeri Perjalanan (`/gallery`).
  - Halaman Admin untuk kelola foto Galeri (`/admin/gallery`).
  - Halaman Admin untuk moderasi Testimoni (`/admin/testimoni`).
- **REST API Routes (Kerangka untuk APK Mobile)**:
  - `POST /api/auth/login`
  - `GET /api/dashboard/stats`
  - `GET /api/bookings` & `GET /api/bookings/[id]` & `PATCH /api/bookings/[id]/status`
  - `GET /api/payments` & `POST /api/payments`
  - `GET /api/destinations` & `POST /api/destinations`
  - `GET /api/trips` & `POST /api/trips`

### Changed (Diubah)
- **Arsitektur Layout**: Menggunakan fitur Next.js *Route Groups* (`src/app/(public)`) untuk memisahkan Layout halaman publik (dengan Navbar & Footer) dan Layout khusus Admin (tanpa Navbar & Footer publik).

### Fixed (Diperbaiki)
- Memperbaiki peringatan aksesibilitas (Hydration errors) pada tombol navigasi Shadcn v4/Base UI dengan mengganti props `asChild` menjadi penerapan langsung `className={buttonVariants()}` atau prop `render`.
- Memperbaiki isu "controlled vs uncontrolled input" pada komponen `Select` dan `RadioGroup` di form pendaftaran dengan menetapkan *fallback default values*.

### Security & Performance
- Menerapkan desain *Mobile-First* di seluruh layout (Admin & Publik).
- Implementasi Next/Image untuk optimisasi aset gambar otomatis dengan pendaftaran remote URL dari Unsplash di `next.config.ts`.
