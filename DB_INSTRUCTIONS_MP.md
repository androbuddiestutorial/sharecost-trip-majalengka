# Penyesuaian Kolom Meeting Point per Trip

Halo bro, karena sekarang fitur **Meeting Point & Harga** menjadi spesifik per Jadwal Trip, maka kita butuh menambahkan 1 kolom baru pada tabel `trips` di database Supabase kamu.

Silakan **Copy-Paste** script SQL di bawah ini dan jalankan di **SQL Editor** pada Supabase Dashboard kamu:

```sql
ALTER TABLE trips ADD COLUMN meeting_points JSONB DEFAULT '[]'::jsonb;
```

Itu saja! Setelah ini di-*run*, admin sudah bisa membuat Jadwal Trip dengan opsi Meeting Point & harganya masing-masing, dan harga totalnya akan langsung berubah (seperti di Shopee) saat pengunjung memilihnya.
