# Changelog

Semua perubahan yang mencolok pada project **Sharecosttrip Majalengka** akan didokumentasikan di file ini.

## [Fase Sinkronisasi APK Admin & UI/UX] - 2026-09-30

### Added (Ditambahkan)
- **Aplikasi Flutter (APK Admin)**: Perombakan UI/UX baru pada Dashboard (Grafik Tren Pesanan 7-Hari via `fl_chart`, efek *Shimmer loading*, dan *Empty States*), lengkap dengan sinkronisasi logika web admin terbaru (Harga Meeting Point, Sisa Tagihan).
- **Sistem Detail Peserta Manifest**: Pada halaman Manifest APK, admin kini dapat mengklik tiap rombongan peserta untuk membedah data rinci Anggota Utama dan Tambahan, lengkap dengan Riwayat Kesehatan (*Health Declaration*) dan akses cepat tombol "Hubungi Kontak Darurat (WA)" yang berwarna mencolok.
- **Notifikasi Notifikasi Pembayaran**: Penambahan sistem otomatis (WebPush, Firebase FCM, Nodemailer) yang akan langsung mengirim notifikasi email dan membunyikan alarm di HP Admin seketika ada pelanggan yang menekan tombol *Submit* konfirmasi pembayaran.

### Changed (Diubah)
- **Hirarki Manifest (Accordion)**: Daftar anggota di aplikasi (APK) tidak lagi disajikan secara datar (*flat list*), melainkan dikelompokkan (Grup/Accordion) berdasarkan Kode Booking / Pendaftar Utama, sehingga tidak berantakan saat jumlah peserta puluhan.
- **Routing Email Notifikasi Multi-Admin**: Pengiriman laporan/notifikasi masuk dialihkan ke sistem variabel fleksibel (`ADMIN_EMAILS`). Hal ini memungkinkan fitur *multi-admin broadcasting* (email lebih dari satu dengan pemisah koma) tanpa harus mengganggu tampilan email kontak resmi di halaman pengunjung (publik).
- **Perhitungan Sisa Kuota Otomatis**: Tabel 'Jadwal Trip' di Web Admin dan Aplikasi APK kini secara cerdas mengakumulasi (secara *realtime*) jumlah kapasitas kursi tersisa (*Pax*) berdasarkan status pendaftar yang valid. Web Admin akan menyalakan peringatan warna merah saat sisa kuota kritis (<= 2).

### Fixed (Diperbaiki)
- **Dart & TypeScript Compilation Errors**: Memperbaiki lebih dari 30 kesalahan logika *string interpolation* dan *unresolved references* di dalam kode Flutter (`admin_apk`), serta menyelesaikan kegagalan *deploy* / *build pipeline* di server Vercel (TS2304 - *Cannot find name bookingsMap*).

## [Fase Penyempurnaan Keuangan & Manajemen Pembayaran] - 2026-09-28

### Added (Ditambahkan)
- **Sistem Pembayaran Hirarkis (Accordion)**: Tabel Data Pembayaran di Admin kini dikelompokkan secara cerdas per Kode Booking (Master Row), yang mana bila diklik akan membuka rincian riwayat pembayaran (DP 1, DP 2, Lunas) dalam bentuk *Accordion*.
- **Direct WA Buttons (Pelunasan & Refund)**: Menambahkan tombol aksi cepat WhatsApp di tabel Manajemen Booking. Tombol akan berubah otomatis: Merah untuk memproses konfirmasi Refund (saat dibatalkan), dan Hijau untuk menagih sisa pelunasan (dengan link otomatis).
- **Kalkulasi Cerdas Pelunasan Publik**: Form Pembayaran Publik (via link peserta) kini bisa membaca riwayat DP peserta. Opsi otomatis terkunci ke nominal Sisa Tagihan dan form disembunyikan/dikunci jika tagihan sudah Lunas sepenuhnya.

### Changed (Diubah)
- **Simplifikasi Status Booking**: Penyederhanaan pilihan status oleh Admin di *dropdown* menjadi 3 status utama yang lebih esensial (Menunggu Verifikasi, Terverifikasi, Dibatalkan).
- **Reactive Status Pembayaran**: Jika Status Booking diatur ke 'Menunggu Verifikasi', Status Pembayaran akan terkunci otomatis di 'Belum Bayar' untuk meminimalisasi *human error* admin.
- **Pricing Meeting Point Dinamis**: Skema *pricing* destinasi ditiadakan dan dialihkan sepenuhnya pada *array Meeting Points*. Harga total (*Total per Pax*) dikalkulasi 100% dari harga Meeting Point yang dipilih.

### Fixed (Diperbaiki)
- **Penghapusan DP/Lunas Otomatis (Downgrade/Reset)**: Mengatasi isu pembukuan ganda dengan secara otomatis menghapus bersih riwayat pembayaran *Manual/Cash* apabila Admin menurunkan kembali *(downgrade)* status booking dari Lunas ke DP, atau meresetnya ke 'Belum Bayar'.

## [Fase Integrasi Database & Penyempurnaan Sistem] - 2026-09-27

### Added (Ditambahkan)
- **Form Tambah Booking Manual (Admin)**: Halaman khusus /admin/bookings/create bagi admin untuk memindahkan data peserta offline/lama. Dilengkapi auto-kalkulasi harga, perhitungan otomatis DP (50%) & Lunas, serta sinkronisasi otomatis ke Sisa Kuota jadwal publik.
- **Form Pembayaran Publik (/pembayaran)**: Halaman untuk peserta melakukan konfirmasi pembayaran dan mengunggah bukti transfer, terhubung otomatis dengan WhatsApp verifikasi admin.
- **Cek Pesanan (/cek-pesanan)**: Halaman tracking invoice dan status pembayaran peserta secara real-time.
- **Dynamic Gallery & YouTube Support**: Fitur kategori dinamis pada galeri, *Lightbox Modal* untuk melihat foto berukuran penuh, serta dukungan input link YouTube (Biasa/Shorts) untuk ditampilkan sebagai *Video Embed* di galeri.

### Changed (Diubah)
- **Generalisasi Kosakata Alam**: Penyesuaian kata-kata dari "Pendakian/Pendaki" menjadi "Trip/Petualangan/Peserta" di seluruh bagian website untuk menjangkau target market yang lebih luas (pantai, air terjun, camping umum).
- **SEO & Metadata Optimization**: Update metadata (Title, OpenGraph, Twitter Card) menjadi format baku **"Sharecost Trip Majalengka | Open Trip | Private Trip"** untuk mempermudah indeks Google dan tampilan *WhatsApp Preview* yang lebih profesional.

### Fixed (Diperbaiki)
- **Sisa Kuota Real-time**: Perhitungan sisa kuota dihitung secara live berdasarkan total Pax dari pesanan yang valid, dengan auto-disable tombol daftar jika jadwal penuh.
- **Supabase RLS & Bucket Upload**: Penyesuaian kebijakan *Row Level Security* (RLS) di database yang mengizinkan *public anon key* untuk mengunggah bukti pembayaran tanpa harus *login*.
- **PDF Print View Invoice**: Menyembunyikan elemen Navbar dan Footer dengan CSS khusus (print:hidden) ketika halaman Cek Pesanan dicetak atau disave ke PDF.

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

