# Rencana Aplikasi Admin (Update Terbaru)

Dokumen ini berisi pembaruan rencana pengembangan aplikasi khusus Admin, disesuaikan dengan fitur canggih yang sudah berhasil kita tanamkan di website (Supabase, Web Push Notification, dan Email).

---

## 1. Kondisi Saat Ini (Pencapaian Web Admin)
Saat ini, *dashboard* Admin di website sudah sangat canggih dan memiliki fitur setara aplikasi *native*:
- **Web Push Notifications**: Notifikasi instan ("Ting!") sudah berfungsi langsung ke layar HP/PC (via VAPID) tanpa perlu aplikasi tambahan.
- **Email Notifications**: Terintegrasi via Nodemailer.
- **Responsive & PWA Ready**: Website sudah dirancang sangat mulus untuk layar HP. 
- **Direct WhatsApp Link**: Tombol konfirmasi WhatsApp otomatis sudah berfungsi sempurna.

---

## 2. Pilihan Rute Pengembangan Aplikasi Admin

Mengingat kondisi di atas, kita memiliki **3 Opsi Rute** untuk "Aplikasi Admin" ini:

### OPSI A: Progressive Web App (PWA) - *Sangat Direkomendasikan & Langsung Jadi!*
Tidak perlu *coding* aplikasi terpisah. Admin hanya perlu membuka `sharecosttripmajalengka.biz.id/admin` di Chrome HP, lalu klik **"Add to Home Screen" (Tambahkan ke Layar Utama)**.
- **Kelebihan**: Langsung jadi hari ini, ukuran 0 MB, notifikasi Web Push sudah jalan, update otomatis (tidak perlu download APK baru jika ada perubahan).
- **Kekurangan**: Tidak bisa di-upload ke Play Store (kecuali dibungkus TWA).

### OPSI B: WebView / TWA Wrapper (Aplikasi Ringan)
Kita membuat aplikasi Android sederhana menggunakan Flutter atau React Native yang isinya hanya "membungkus" (WebView) halaman website admin.
- **Kelebihan**: Menghasilkan file `.apk` asli yang bisa diinstal/dibagikan atau masuk Play Store. Waktu pembuatan sangat cepat (hanya beberapa jam).
- **Kekurangan**: Tergantung pada koneksi internet untuk memuat tampilan UI karena UI berasal dari web.

### OPSI C: Full Native App (React Native / Expo)
Sesuai rencana awal, kita membangun ulang seluruh antarmuka (UI) dari nol menggunakan React Native. Aplikasi berkomunikasi ke Supabase melalui REST API Next.js.
- **Kelebihan**: Animasi sangat mulus (*native feel*), bisa kerja *offline* (caching), dan bisa memakai fitur HP spesifik (seperti Bluetooth Thermal Printer).
- **Kekurangan**: Memakan waktu lebih lama untuk *coding* ulang halaman-halaman seperti Tabel Peserta, Galeri, dll. Memerlukan integrasi Firebase Cloud Messaging (FCM) karena Web Push tidak bekerja di *background app native*.

---

## 3. Langkah Selanjutnya (Action Plan)

1. **Evaluasi Kebutuhan**: Tentukan apakah fitur PWA (Opsi A) sudah mencukupi kebutuhan operasional sehari-hari.
2. **Jika Butuh APK Cepat**: Kita akan eksekusi Opsi B (WebView Wrapper).
3. **Jika Ingin Skala Besar**: Kita akan siapkan direktori baru `sharecosttrip-mobile-admin` dan inisialisasi **Expo (React Native)** untuk mulai mengeksekusi Opsi C.
