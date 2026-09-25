# Rencana Pembuatan APK Admin (Mobile App)

Dokumen ini berisi arsitektur, alur kerja (flow), dan strategi pengembangan untuk aplikasi mobile (APK) khusus Admin Sharecosttrip Majalengka.

---

## 1. Tujuan Utama APK
- **Aksesibilitas Tinggi**: Memungkinkan admin memantau pendaftaran, pembayaran, dan mengelola trip dari mana saja hanya menggunakan smartphone.
- **Notifikasi Real-Time**: Memberikan notifikasi langsung (Push Notification) ke HP admin setiap kali ada pendaftaran atau pembayaran masuk di website.
- **Efisiensi Mobile**: UI/UX dirancang khusus untuk layar kecil agar verifikasi data dan chat WhatsApp bisa dilakukan dengan 1-2 ketukan.

---

## 2. Rekomendasi Teknologi (Tech Stack)

Karena website dibangun dengan React (Next.js), rekomendasi terbaik untuk APK adalah:
- **Framework**: **React Native (dengan Expo)**.
  *Alasan*: Bahasa pemrogramannya sama (JavaScript/TypeScript + React). Komponen logika bisa banyak yang didaur ulang. Sangat efisien dan cepat dikembangkan.
- **Push Notification**: **Firebase Cloud Messaging (FCM)** atau **OneSignal**.
  *Alasan*: Gratis, sangat andal, dan mudah diintegrasikan dengan Expo/React Native.
- **State Management & API Fetching**: **TanStack Query (React Query)**.
  *Alasan*: Caching otomatis, sangat efisien menghemat kuota internet di mobile, dan bisa melakukan background fetching.
- **Database Backend**: Berkomunikasi melalui REST API Next.js (`/api/...`) dan/atau langsung menggunakan **Supabase SDK**.

---

## 3. Alur Sistem Notifikasi Real-Time (Notification Flow)

Agar APK selalu menerima notifikasi instan secara efisien tanpa membuat baterai boros, kita menggunakan arsitektur *Push (Server-to-Client)*:

```text
[PESERTA] -> Isi Form Web -> Klik Submit
       |
[WEB/API NEXT.JS] -> Simpan data ke Database (Supabase)
       |
[API NEXT.JS / SUPABASE WEBHOOK] -> Kirim trigger ke Server Firebase (FCM) / OneSignal
       |
[SERVER FIREBASE] -> Kirim Push Notification ke HP Admin ("Ting!")
       |
[HP ADMIN] -> Muncul pop-up: "Pendaftaran Baru: Budi (Gn. Ciremai)"
       |
[ADMIN] -> Klik Notifikasi -> APK otomatis terbuka langsung ke Halaman Detail Booking Budi.
```

---

## 4. Alur Kerja Admin di dalam APK (User Flow)

APK difokuskan pada aksi cepat (Quick Actions). Tidak perlu fitur yang terlalu rumit.

1. **Login Screen**: Admin login menggunakan email dan password (mendapatkan Session Token).
2. **Dashboard Tab**:
   - Menampilkan metrik sederhana (Total pendaftaran hari ini, Menunggu Verifikasi).
   - Menampilkan *Infinite Scroll* dari Booking terbaru.
3. **Notifikasi Masuk (Push)**:
   - Admin klik notifikasi pendaftaran baru.
4. **Booking Detail Screen**:
   - Data pemesan, data anggota, dan jawaban kuesioner medis dirangkum dalam bentuk *Accordion* (bisa dilipat agar efisien di layar kecil).
   - Terdapat tombol besar mengambang (Floating Action Button / FAB) berwarna hijau: **"Chat WhatsApp"**.
   - Ketika diklik, APK menggunakan fitur *Deep Linking* (misal `Linking.openURL('whatsapp://send...')`) untuk otomatis membuka aplikasi WhatsApp di HP admin dengan pesan yang sudah diketikkan otomatis.
5. **Update Status**:
   - Setelah chat dengan peserta, admin kembali ke APK.
   - Mengubah status via Dropdown/BottomSheet menjadi "Data Diverifikasi".
   - APK mengirim *PATCH Request* ke `/api/bookings/[id]/status`.

---

## 5. Strategi Efisiensi Mobile (Performance & Data)

Agar APK ringan, hemat baterai, dan cepat:
- **Pagination & Lazy Loading**: Endpoint `/api/bookings` dipanggil dengan batasan (misal `limit=10`). Sisa data dimuat ketika admin men-scroll layar ke bawah.
- **Caching**: Menggunakan React Query agar ketika admin membuka detail booking yang sama kedua kalinya, data tidak perlu di-download ulang dari server kecuali ada perubahan.
- **Optimistic UI Updates**: Saat admin menekan tombol "Verifikasi", UI langsung berubah sukses tanpa perlu menunggu *loading spinner* dari server. Di balik layar, request baru dikirim.
- **Image Optimization**: Menampilkan foto bukti pembayaran dalam resolusi rendah/thumbnail, dan hanya memuat gambar HD jika gambar tersebut ditekan (Zoom).

---

## 6. Tahapan Eksekusi (Roadmap APK)

Setelah konfigurasi Supabase pada web selesai, pengerjaan APK dapat dilakukan dengan urutan:
1. **Setup Expo & Firebase**: Membuat project aplikasi dan mendaftarkan sertifikat push notification (APNs untuk iOS, FCM untuk Android).
2. **Autentikasi Mobile**: Integrasi sistem login API yang telah dibuat.
3. **Dashboard & List View**: Membangun UI untuk melihat daftar booking dan mengonsumsi API `GET /api/bookings`.
4. **Detail & WhatsApp Link**: Membangun halaman detail dan aksi direct-to-WhatsApp.
5. **Konfigurasi Webhook Notifikasi**: Menyambungkan API Next.js dengan Firebase agar notifikasi terpicu saat ada pendaftaran.
6. **Build & Release**: Export aplikasi menjadi file `.apk` (Android) atau `.aab` untuk diunggah ke Play Store / dibagikan internal.
